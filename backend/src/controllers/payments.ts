import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { paystack } from "../services/paystack.js";
import { notifications } from "../services/notifications.js";
import { sms } from "../services/sms.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from "../errors.js";
import { config } from "../config.js";
import { logger } from "../logger.js";
import { formatPhone, genRef, isValidPhone } from "../utils.js";

// =============== Validation schemas ===============

export const initiateActivationPaymentSchema = z.object({
  loanId: z.string().min(1),
  phone: z.string().min(10).max(15),
});

export const initiateRepaymentSchema = z.object({
  loanId: z.string().min(1),
  phone: z.string().min(10).max(15),
  amount: z.number().int().positive(),
});

export const verifyPaymentSchema = z.object({
  reference: z.string().min(1),
});

// =============== Handlers ===============

/**
 * Initiate M-Pesa STK Push for the activation fee.
 * The customer will receive an M-Pesa prompt on their phone.
 * When they enter their M-Pesa PIN, Paystack fires a webhook to
 * /api/v1/webhooks/paystack, which marks the loan as paid.
 */
export async function initiateActivationPayment(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { loanId, phone: rawPhone } = req.body as z.infer<
    typeof initiateActivationPaymentSchema
  >;

  if (!isValidPhone(rawPhone)) {
    throw new BadRequestError(
      "Please enter a valid M-Pesa number (e.g. 0712345678)",
    );
  }
  const phone = formatPhone(rawPhone);

  const loan = await prisma.loan.findFirst({
    where: { id: loanId, userId: req.user.userId },
  });
  if (!loan) throw new NotFoundError("Loan not found");
  if (loan.activationFeePaid) {
    throw new ConflictError("Activation fee already paid");
  }
  if (loan.status === "rejected" || loan.status === "cancelled") {
    throw new BadRequestError(`Cannot pay: loan is ${loan.status}`);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });
  if (!user) throw new UnauthorizedError();

  // Create PaymentIntent
  const reference = genRef("ACT");
  const intent = await prisma.paymentIntent.create({
    data: {
      userId: user.id,
      amount: loan.activationFee,
      type: "activation-fee",
      reference,
      phone,
      status: "pending",
      metadata: JSON.stringify({ loanId: loan.id }),
    },
  });

  // Trigger Paystack M-Pesa STK push
  let paystackResult;
  try {
    paystackResult = await paystack.chargeMpesaSTK({
      amount: loan.activationFee,
      email: user.email,
      phone,
      reference,
      metadata: {
        intentId: intent.id,
        userId: user.id,
        loanId: loan.id,
        type: "activation-fee",
      },
      callbackUrl: `${config.apiUrl}/api/v1/webhooks/paystack`,
    });
  } catch (err) {
    // Mark intent as failed
    await prisma.paymentIntent.update({
      where: { id: intent.id },
      data: {
        status: "failed",
        failureReason: (err as Error).message,
      },
    });
    throw err;
  }

  // Update intent with Paystack details
  await prisma.paymentIntent.update({
    where: { id: intent.id },
    data: {
      paystackRef: paystackResult.reference,
      authorizationUrl: paystackResult.authorizationUrl,
      accessCode: paystackResult.accessCode,
      status: paystackResult.status === "success" ? "success" : "processing",
    },
  });

  // Update loan status
  await prisma.loan.update({
    where: { id: loan.id },
    data: { status: "fees-required" },
  });

  // Notify user
  await notifications.create(user.id, {
    title: "M-Pesa prompt sent",
    message: `Check your phone and enter your M-Pesa PIN to pay KSh ${loan.activationFee.toLocaleString()}.`,
    type: "info",
    category: "payment",
    sendSms: true,
    smsMessage: `GETON: M-Pesa prompt sent to ${phone}. Enter PIN to pay KSh ${loan.activationFee.toLocaleString()} activation fee.`,
  });

  logger.info(
    { userId: user.id, loanId: loan.id, reference, phone, paystackStatus: paystackResult.status },
    "Activation STK push sent",
  );

  res.json({
    success: true,
    data: {
      intentId: intent.id,
      reference,
      status: paystackResult.status,
      authorizationUrl: paystackResult.authorizationUrl,
      displayMessage: paystackResult.displayMessage,
      message:
        paystackResult.status === "success"
          ? "Payment received successfully!"
          : "M-Pesa STK push sent. Please check your phone and enter your M-Pesa PIN.",
    },
  });
}

/**
 * Poll for payment status. Used by the frontend while waiting for
 * the webhook to fire.
 */
export async function verifyPayment(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { reference } = req.body as z.infer<typeof verifyPaymentSchema>;

  const intent = await prisma.paymentIntent.findFirst({
    where: { reference, userId: req.user.userId },
  });
  if (!intent) throw new NotFoundError("Payment not found");

  // If still pending/processing, check with Paystack directly
  if (intent.status === "pending" || intent.status === "processing") {
    try {
      const paystackStatus = await paystack.verifyTransaction(reference);

      if (paystackStatus.status === "success" && (intent.status as string) !== "success") {
        // Manually process the success (webhook may be delayed)
        await handleChargeSuccess({
          reference,
          amount: paystackStatus.amount,
          channel: paystackStatus.channel,
          paid_at: paystackStatus.paidAt,
          customer: paystackStatus.customer,
          metadata: paystackStatus.metadata,
        });
      } else if (
        paystackStatus.status === "failed" ||
        paystackStatus.status === "abandoned"
      ) {
        await prisma.paymentIntent.update({
          where: { id: intent.id },
          data: {
            status: paystackStatus.status,
            failureReason: "Payment failed or abandoned",
          },
        });
      }
    } catch (err) {
      logger.warn(
        { err, reference },
        "Paystack verify failed (will rely on webhook)",
      );
    }
  }

  const fresh = await prisma.paymentIntent.findUnique({
    where: { id: intent.id },
  });

  res.json({ success: true, data: fresh });
}

/**
 * Paystack webhook handler.
 *
 * Receives events for:
 *   - charge.success → activation fee paid (and triggers auto-disbursement)
 *   - charge.failed
 *   - transfer.success → B2C loan disbursement succeeded
 *   - transfer.failed
 *   - transfer.reversed
 *
 * The HMAC-SHA512 signature is verified using the raw request body
 * captured by the express.json verify hook in server.ts.
 */
export async function paystackWebhook(
  req: Request,
  res: Response,
): Promise<void> {
  const rawBody = (req as any).rawBody as string | undefined;
  const signature = req.headers["x-paystack-signature"] as string | undefined;

  if (!rawBody) {
    logger.error("Webhook received but rawBody is missing — express.json verify hook not configured");
    res.status(400).send("Missing body");
    return;
  }

  if (!signature) {
    logger.warn("Webhook received without x-paystack-signature header");
    res.status(400).send("Missing signature");
    return;
  }

  // CRITICAL: Verify signature BEFORE parsing or processing
  if (!paystack.verifyWebhookSignature(rawBody, signature)) {
    logger.warn(
      { ip: req.ip, signaturePrefix: signature.substring(0, 8) },
      "Webhook signature verification failed",
    );
    res.status(401).send("Invalid signature");
    return;
  }

  // Parse the verified event
  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    logger.error({ err }, "Webhook body is not valid JSON");
    res.status(400).send("Invalid JSON");
    return;
  }

  // Persist the event (for audit & retry)
  let saved;
  try {
    saved = await prisma.webhookEvent.create({
      data: {
        provider: "paystack",
        event: event.event,
        reference: event.data?.reference,
        payload: rawBody,
      },
    });
  } catch (err) {
    logger.error({ err }, "Failed to persist webhook event");
    // Continue processing anyway — don't fail the webhook
  }

  logger.info(
    {
      event: event.event,
      reference: event.data?.reference,
      webhookId: saved?.id,
    },
    "Paystack webhook received & verified",
  );

  // Process the event
  try {
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data);
        break;
      case "charge.failed":
      case "charge.abandoned":
        await handleChargeFailed(event.data);
        break;
      case "transfer.success":
        await handleTransferSuccess(event.data);
        break;
      case "transfer.failed":
      case "transfer.reversed":
        await handleTransferFailed(event.data);
        break;
      default:
        logger.info({ event: event.event }, "Unhandled webhook event (not critical)");
    }

    if (saved) {
      await prisma.webhookEvent.update({
        where: { id: saved.id },
        data: { processed: true, processedAt: new Date() },
      });
    }
  } catch (err: any) {
    logger.error(
      { err, event: event.event, reference: event.data?.reference },
      "Webhook processing failed",
    );
    if (saved) {
      await prisma.webhookEvent.update({
        where: { id: saved.id },
        data: { error: err.message },
      });
    }
    // Return 500 so Paystack retries
    res.status(500).send("Processing failed");
    return;
  }

  // Always 200 to acknowledge receipt
  res.status(200).send("OK");
}

// =============== Webhook handlers ===============

interface ChargeData {
  reference: string;
  amount: number; // Paystack sends this in kobo/cents
  channel: string;
  paid_at?: string;
  customer?: { email: string; phone?: string };
  metadata?: any;
  gateway_response?: string;
}

async function handleChargeSuccess(data: ChargeData) {
  const reference = data.reference;
  if (!reference) {
    logger.warn("charge.success webhook missing reference");
    return;
  }

  // Idempotency: check if this intent is already processed
  const intent = await prisma.paymentIntent.findUnique({
    where: { reference },
  });
  if (!intent) {
    logger.warn({ reference }, "charge.success for unknown payment intent");
    return;
  }
  if (intent.status === "success") {
    logger.info({ reference }, "charge.success already processed (idempotent)");
    return;
  }

  const amount = data.amount / 100; // Convert from kobo to KES
  const metadata = data.metadata || {};
  const loanId = metadata.loanId || metadata.custom_fields?.find(
    (f: any) => f.variable_name === "loan_id",
  )?.value;

  // Use a transaction for atomicity
  await prisma.$transaction(async (tx) => {
    // Mark intent as successful
    await tx.paymentIntent.update({
      where: { id: intent.id },
      data: {
        status: "success",
        completedAt: new Date(),
        metadata: JSON.stringify({
          ...metadata,
          raw: data,
          paidAt: data.paid_at,
        }),
      },
    });

    // Create transaction record
    await tx.transaction.create({
      data: {
        userId: intent.userId,
        type: "fee",
        description: `Loan activation fee`,
        amount,
        status: "successful",
        reference: genRef("TX"),
        channel: "mpesa-stk",
        metadata: JSON.stringify({ intentId: intent.id, paystackRef: reference }),
        balanceAfter: intent.userId ? null : null,
      },
    });

    // Process by payment intent type
    if (intent.type === "activation-fee" && loanId) {
      const loan = await tx.loan.findUnique({ where: { id: loanId } });
      if (loan) {
        // Create the activation fee record
        await tx.activationFee.create({
          data: {
            loanId: loan.id,
            type: "processing",
            amount,
            reference,
            channel: "mpesa-stk",
          },
        });

        // Mark the loan as paid and approved
        await tx.loan.update({
          where: { id: loan.id },
          data: {
            activationFeePaid: true,
            status: "approved",
            // First repayment due in 30 days
            nextPaymentAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        logger.info(
          { loanId: loan.id, userId: loan.userId, amount },
          "Loan activation fee paid — auto-disbursing",
        );

        // Auto-disburse the loan via B2C transfer (fire and forget)
        // We do this OUTSIDE the transaction so the webhook returns 200
        // immediately and the B2C transfer runs in the background
        setImmediate(async () => {
          try {
            await disburseLoanAsync(loan.id);
          } catch (err) {
            logger.error(
              { err, loanId: loan.id },
              "Auto-disbursement failed — manual retry required",
            );
            // Notify the user — re-fetch the loan to avoid closure shadowing
            const freshLoan = await prisma.loan.findUnique({
              where: { id: loan.id },
              include: { user: true },
            });
            if (freshLoan) {
              await notifications.create(freshLoan.userId, {
                title: "Disbursement delay",
                message: `We're processing your loan of KSh ${freshLoan.amount.toLocaleString()}. You'll receive it within 30 minutes.`,
                type: "warning",
                category: "loan",
              });
            }
          }
        });
      }
    } else if (intent.type === "loan-repayment" && loanId) {
      const loan = await tx.loan.findUnique({ where: { id: loanId } });
      if (loan) {
        const newPaid = loan.amountPaid + amount;
        const newRemaining = Math.max(0, loan.totalRepayment - newPaid);
        const isFullyPaid = newRemaining === 0;

        await tx.loanPayment.create({
          data: {
            loanId: loan.id,
            amount,
            principal: Math.min(amount, newRemaining),
            interest: 0,
            reference,
            channel: "mpesa-stk",
          },
        });

        await tx.loan.update({
          where: { id: loan.id },
          data: {
            amountPaid: newPaid,
            amountRemaining: newRemaining,
            lastPaymentAt: new Date(),
            paidAt: isFullyPaid ? new Date() : loan.paidAt,
            status: isFullyPaid ? "repaid" : "active",
            nextPaymentAt: isFullyPaid
              ? null
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        // Boost credit score on successful payment
        if (isFullyPaid) {
          const user = await tx.user.findUnique({
            where: { id: loan.userId },
          });
          if (user) {
            const newLimit = Math.min(
              config.loan.maxAmount,
              Math.round(user.loanLimit * 1.1),
            );
            await tx.user.update({
              where: { id: user.id },
              data: {
                creditScore: Math.min(850, user.creditScore + 50),
                loanLimit: newLimit,
              },
            });
          }
        }
      }
    } else if (intent.type === "deposit") {
      // Top up the wallet
      const user = await tx.user.findUnique({
        where: { id: intent.userId },
      });
      if (user) {
        const newBalance = user.walletBalance + amount;
        await tx.user.update({
          where: { id: user.id },
          data: { walletBalance: newBalance },
        });
        await tx.transaction.create({
          data: {
            userId: user.id,
            type: "deposit",
            description: "M-Pesa wallet top-up",
            amount,
            status: "successful",
            reference: genRef("TX"),
            channel: "mpesa-stk",
            balanceAfter: newBalance,
          },
        });
      }
    }
  });

  // External notifications (after the transaction commits)
  try {
    const user = await prisma.user.findUnique({ where: { id: intent.userId } });
    if (user) {
      await notifications.create(user.id, {
        title: "Payment received ✅",
        message: `KSh ${amount.toLocaleString()} payment received successfully.`,
        type: "success",
        category: "payment",
        sendSms: true,
        smsMessage: `GETON: KSh ${amount.toLocaleString()} payment received. Thank you!`,
      });

      if (intent.type === "activation-fee" && loanId) {
        const loan = await prisma.loan.findUnique({
          where: { id: loanId },
        });
        if (loan) {
          await notifications.create(user.id, {
            title: "Loan approved! 🎉",
            message: `Your loan of KSh ${loan.amount.toLocaleString()} is approved and being sent to your M-Pesa within minutes.`,
            type: "success",
            category: "loan",
            sendSms: true,
            smsMessage: `GETON: Loan of KSh ${loan.amount.toLocaleString()} approved! Being sent to your M-Pesa.`,
          });
        }
      }
    }
  } catch (err) {
    logger.error({ err }, "Notification failed (non-critical)");
  }
}

async function handleChargeFailed(data: ChargeData) {
  const reference = data.reference;
  if (!reference) return;

  const intent = await prisma.paymentIntent.findUnique({ where: { reference } });
  if (!intent) return;

  await prisma.paymentIntent.update({
    where: { id: intent.id },
    data: {
      status: "failed",
      failureReason:
        data.gateway_response || data.metadata?.gateway_response || "Payment failed",
    },
  });

  const user = await prisma.user.findUnique({ where: { id: intent.userId } });
  if (user) {
    await notifications.create(user.id, {
      title: "Payment failed",
      message: `Your M-Pesa payment could not be completed. Please try again.`,
      type: "warning",
      category: "payment",
      sendSms: true,
      smsMessage: `GETON: Payment failed. Please try again.`,
    });
  }
}

async function handleTransferSuccess(data: ChargeData) {
  // B2C loan disbursement succeeded
  const reference = data.reference;
  if (!reference) return;

  const loan = await prisma.loan.findFirst({
    where: { disbursementRef: reference },
  });
  if (!loan) return;

  await prisma.loan.update({
    where: { id: loan.id },
    data: { status: "active", disbursedAt: new Date() },
  });

  // Create the disbursement transaction
  await prisma.transaction.create({
    data: {
      userId: loan.userId,
      type: "disbursement",
      description: "Loan disbursement to M-Pesa",
      amount: loan.amount,
      status: "successful",
      reference: genRef("TX"),
      channel: "mpesa-b2c",
    },
  });

  const user = await prisma.user.findUnique({ where: { id: loan.userId } });
  if (user) {
    await notifications.create(user.id, {
      title: "Loan disbursed! 🎉",
      message: `KSh ${loan.amount.toLocaleString()} has been sent to your M-Pesa.`,
      type: "success",
      category: "loan",
      sendSms: true,
      smsMessage: `GETON: KSh ${loan.amount.toLocaleString()} sent to your M-Pesa. Repay on time to build your credit.`,
    });
  }

  logger.info(
    { loanId: loan.id, userId: loan.userId, amount: loan.amount },
    "Loan disbursed via B2C",
  );
}

async function handleTransferFailed(data: ChargeData) {
  const reference = data.reference;
  if (!reference) return;

  const loan = await prisma.loan.findFirst({
    where: { disbursementRef: reference },
  });
  if (!loan) return;

  await prisma.loan.update({
    where: { id: loan.id },
    data: { status: "fees-required" }, // back to awaiting retry
  });

  const user = await prisma.user.findUnique({ where: { id: loan.userId } });
  if (user) {
    await notifications.create(user.id, {
      title: "Disbursement delayed",
      message: `We're processing your loan of KSh ${loan.amount.toLocaleString()}. Our team will retry within 30 minutes.`,
      type: "warning",
      category: "loan",
      sendSms: true,
      smsMessage: `GETON: Disbursement in progress. You'll be notified when complete.`,
    });
  }
}

// =============== Auto-disbursement helper ===============

/**
 * Trigger B2C transfer to send the loan to the customer's M-Pesa.
 * Called automatically when the activation fee is paid.
 */
async function disburseLoanAsync(loanId: string) {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: { user: { include: { kyc: true } } },
  });
  if (!loan || loan.status !== "approved") {
    logger.warn({ loanId }, "Loan not in approved status, skipping disbursement");
    return;
  }

  const kyc = loan.user.kyc;
  const mpesaNumber =
    kyc?.mpesaNumber?.replace(/^\+/, "") ||
    loan.user.phone.replace(/^\+/, "");
  const cleanPhone = formatPhone(mpesaNumber);

  const ref = genRef("DISB");

  try {
    // 1. Create transfer recipient
    const recipient = await paystack.createTransferRecipient({
      name: loan.user.fullName,
      phone: cleanPhone,
    });

    // 2. Initiate B2C transfer
    const transfer = await paystack.initiateTransfer({
      amount: loan.amount,
      recipientCode: recipient.recipientCode,
      reason: `GETON loan disbursement for ${loan.id}`,
      reference: ref,
    });

    // 3. Store the disbursement reference
    // The webhook will mark the loan as 'active' when the transfer succeeds
    await prisma.loan.update({
      where: { id: loan.id },
      data: { disbursementRef: ref },
    });

    logger.info(
      { loanId: loan.id, transferCode: transfer.transferCode, ref },
      "B2C transfer initiated",
    );
  } catch (err) {
    logger.error({ err, loanId }, "B2C transfer failed");
    throw err;
  }
}
