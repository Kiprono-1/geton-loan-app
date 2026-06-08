import axios, { AxiosInstance, AxiosError } from "axios";
import crypto from "crypto";
import { config } from "../config.js";
import { logger } from "../logger.js";
import { BadRequestError, InternalServerError } from "../errors.js";

/**
 * Paystack API wrapper for M-Pesa STK Push.
 *
 * Paystack M-Pesa flow:
 *   1. POST /charge with mobile_money: { phone, provider: "mpesa" }
 *      → Returns { status: "pay_offline" } or { status: "success" }
 *   2. Paystack sends M-Pesa prompt to the user's phone via Daraja
 *   3. User enters M-Pesa PIN on their phone
 *   4. Paystack fires webhook (charge.success) to our /webhooks/paystack
 *   5. We verify the HMAC-SHA512 signature, then update our DB
 *
 * Docs: https://paystack.com/docs/api/#charge-create
 */

interface ChargeParams {
  amount: number; // in KES (whole units)
  email: string;
  phone: string; // E.164 format: 2547XXXXXXXX
  reference: string;
  metadata?: Record<string, any>;
  callbackUrl?: string;
}

interface ChargeResponse {
  status: "success" | "pay_offline" | "failed";
  reference: string;
  authorizationUrl?: string;
  accessCode?: string;
  displayMessage?: string;
  referencePaystack?: string;
}

interface VerifyResponse {
  status: "success" | "failed" | "abandoned" | "pending" | "reversed";
  amount: number; // in KES
  currency: string;
  channel: string;
  paidAt: string | null;
  customer: { email: string; phone?: string };
  metadata?: any;
  reference: string;
}

interface TransferRecipient {
  recipientCode: string;
}

interface TransferResult {
  transferCode: string;
  status: string;
  reference: string;
}

class PaystackService {
  private client: AxiosInstance;
  private baseUrl = "https://api.paystack.co";

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${config.paystack.secretKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 60_000, // 60s for slow M-Pesa responses
    });

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (res) => res,
      (err: AxiosError) => {
        logger.error(
          {
            url: err.config?.url,
            method: err.config?.method,
            status: err.response?.status,
            data: err.response?.data,
            message: err.message,
          },
          "Paystack API error",
        );
        return Promise.reject(err);
      },
    );
  }

  /**
   * Initiate a M-Pesa STK Push charge.
   *
   * Paystack expects:
   *   amount: in smallest currency unit (kobo/cents). For KES → × 100
   *   email: required (we use the user's email)
   *   currency: "KES"
   *   reference: unique transaction ref
   *   channels: ["mobile_money"]
   *   mobile_money: { phone, provider: "mpesa" }
   *   metadata: { custom_field: ... }
   *   callback_url: optional webhook fallback
   */
  async chargeMpesaSTK(params: ChargeParams): Promise<ChargeResponse> {
    try {
      // Paystack needs amount in smallest currency unit
      // KES uses 2 decimal places on Paystack
      const amountInKobo = Math.round(params.amount * 100);

      const response = await this.client.post("/charge", {
        amount: amountInKobo,
        email: params.email,
        currency: "KES",
        reference: params.reference,
        callback_url:
          params.callbackUrl || `${config.apiUrl}/api/v1/webhooks/paystack`,
        metadata: {
          ...params.metadata,
          phone: params.phone,
          custom_fields: [
            {
              display_name: "Phone Number",
              variable_name: "phone",
              value: params.phone,
            },
            {
              display_name: "Loan ID",
              variable_name: "loan_id",
              value: params.metadata?.loanId || "",
            },
          ],
        },
        channels: ["mobile_money"],
        mobile_money: {
          phone: params.phone,
          provider: "mpesa",
        },
      });

      const data = response.data?.data;
      if (!response.data?.status || !data) {
        throw new BadRequestError(
          response.data?.message || "Paystack charge initiation failed",
        );
      }

      logger.info(
        {
          reference: data.reference,
          amount: params.amount,
          phone: params.phone,
          paystackStatus: data.status,
        },
        "Paystack M-Pesa STK push initiated",
      );

      return {
        status: data.status,
        reference: data.reference,
        authorizationUrl: data.authorization_url,
        accessCode: data.access_code,
        displayMessage: data.display_message,
        referencePaystack: data.reference,
      };
    } catch (err: any) {
      // Extract the most useful error message from Paystack
      const paystackMessage = err.response?.data?.message;
      const paystackCode = err.response?.data?.code;
      const message = paystackMessage || err.message || "Paystack error";

      logger.error(
        {
          phone: params.phone,
          amount: params.amount,
          paystackMessage,
          paystackCode,
          paystackData: err.response?.data,
        },
        "Paystack M-Pesa charge failed",
      );

      // Throw a more specific error
      throw new BadRequestError(
        `Payment failed: ${message}${paystackCode ? ` (${paystackCode})` : ""}`,
      );
    }
  }

  /**
   * Verify a charge by reference.
   * GET /transaction/verify/:reference
   * Used to poll STK push status if the webhook is delayed.
   */
  async verifyTransaction(reference: string): Promise<VerifyResponse> {
    try {
      const response = await this.client.get(
        `/transaction/verify/${encodeURIComponent(reference)}`,
      );
      const data = response.data?.data;
      if (!response.data?.status || !data) {
        throw new BadRequestError("Verification failed");
      }
      return {
        status: data.status,
        amount: data.amount / 100,
        currency: data.currency,
        channel: data.channel,
        paidAt: data.paid_at,
        customer: data.customer,
        metadata: data.metadata,
        reference: data.reference,
      };
    } catch (err: any) {
      logger.error({ err, reference }, "Paystack verification failed");
      throw new BadRequestError(
        err.response?.data?.message || "Verification failed",
      );
    }
  }

  /**
   * Create a transfer recipient (for B2C disbursements).
   * For M-Pesa: use type "mobile_money" with provider "mpesa".
   * POST /transferrecipient
   */
  async createTransferRecipient(params: {
    name: string;
    phone: string;
  }): Promise<TransferRecipient> {
    try {
      const response = await this.client.post("/transferrecipient", {
        type: "mobile_money",
        name: params.name,
        account_number: params.phone,
        bank_code: "MPESA", // Paystack's special code for M-Pesa
        currency: "KES",
        metadata: { provider: "mpesa" },
      });
      const data = response.data?.data;
      if (!response.data?.status || !data) {
        throw new BadRequestError(
          response.data?.message || "Failed to create transfer recipient",
        );
      }
      logger.info(
        { recipientCode: data.recipient_code, phone: params.phone },
        "Transfer recipient created",
      );
      return { recipientCode: data.recipient_code };
    } catch (err: any) {
      logger.error({ err, params }, "Failed to create Paystack recipient");
      throw new BadRequestError(
        err.response?.data?.message || "Recipient creation failed",
      );
    }
  }

  /**
   * Initiate a B2C transfer (disburse loan to customer's M-Pesa).
   * POST /transfer
   */
  async initiateTransfer(params: {
    amount: number;
    recipientCode: string;
    reason: string;
    reference: string;
  }): Promise<TransferResult> {
    try {
      const response = await this.client.post("/transfer", {
        source: "balance",
        amount: Math.round(params.amount * 100),
        recipient: params.recipientCode,
        reason: params.reason,
        reference: params.reference,
        currency: "KES",
      });
      const data = response.data?.data;
      if (!response.data?.status || !data) {
        throw new BadRequestError(
          response.data?.message || "Transfer initiation failed",
        );
      }
      logger.info(
        { transferCode: data.transfer_code, reference: data.reference },
        "Transfer initiated",
      );
      return {
        transferCode: data.transfer_code,
        status: data.status,
        reference: data.reference,
      };
    } catch (err: any) {
      logger.error({ err, params }, "Paystack transfer failed");
      throw new BadRequestError(
        err.response?.data?.message || "Transfer failed",
      );
    }
  }

  /**
   * Verify the Paystack webhook signature.
   *
   * The signature is in the `x-paystack-signature` header.
   * It's an HMAC-SHA512 of the raw request body using your webhook secret.
   *
   * CRITICAL: This must be done against the RAW request body, not the
   * parsed JSON. The server.ts middleware captures this as (req as any).rawBody.
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!config.paystack.webhookSecret) {
      logger.error("PAYSTACK_WEBHOOK_SECRET is not set — rejecting webhook");
      return false;
    }
    if (!signature) {
      logger.warn("Webhook received without signature header");
      return false;
    }

    try {
      const hash = crypto
        .createHmac("sha512", config.paystack.webhookSecret)
        .update(rawBody, "utf8")
        .digest("hex");

      // Both must be the same length for timingSafeEqual
      if (hash.length !== signature.length) {
        logger.warn(
          { hashLength: hash.length, sigLength: signature.length },
          "Signature length mismatch",
        );
        return false;
      }

      const isValid = crypto.timingSafeEqual(
        Buffer.from(hash, "utf8"),
        Buffer.from(signature, "utf8"),
      );

      if (!isValid) {
        logger.warn("Webhook signature mismatch");
      }
      return isValid;
    } catch (err) {
      logger.error({ err }, "Error verifying webhook signature");
      return false;
    }
  }

  /**
   * Helper: convert KES whole units to Paystack's kobo/cents.
   * Paystack expects amount in smallest currency unit.
   */
  kesToKobo(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Helper: convert from Paystack's kobo/cents back to KES.
   */
  koboToKes(kobo: number): number {
    return kobo / 100;
  }
}

export const paystack = new PaystackService();
export type { ChargeResponse, VerifyResponse, TransferResult, TransferRecipient };
