/**
 * SMS service using Africa's Talking (sandbox by default).
 * Swap with Twilio, Nexmo, or local provider in production.
 */
import { config } from "../config.js";
import { logger } from "../logger.js";

const AT_BASE = "https://api.africastalking.com/version1";

export class SmsService {
  private enabled: boolean;

  constructor() {
    this.enabled = Boolean(config.sms.apiKey && config.sms.apiKey.length > 0);
  }

  async send(phone: string, message: string): Promise<boolean> {
    if (!this.enabled) {
      logger.info({ phone, message }, "📱 SMS (dev mode — not sent)");
      return true;
    }

    try {
      // Africa's Talking API
      const response = await fetch(`${AT_BASE}/messaging`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          apiKey: config.sms.apiKey,
        },
        body: new URLSearchParams({
          username: config.sms.username,
          to: phone,
          message,
          from: config.sms.senderId,
        }).toString(),
      });

      if (!response.ok) {
        logger.error(
          { status: response.status, phone },
          "SMS send failed",
        );
        return false;
      }
      return true;
    } catch (err) {
      logger.error({ err, phone }, "SMS send error");
      return false;
    }
  }

  async sendOtp(phone: string, code: string): Promise<boolean> {
    return this.send(
      phone,
      `Your GETON verification code is ${code}. Do not share it. Valid for 5 minutes.`,
    );
  }

  async sendLoanApproved(phone: string, amount: number): Promise<boolean> {
    return this.send(
      phone,
      `🎉 GETON: Your loan of KSh ${amount.toLocaleString()} has been approved. Complete activation to receive funds.`,
    );
  }

  async sendLoanDisbursed(phone: string, amount: number): Promise<boolean> {
    return this.send(
      phone,
      `✅ GETON: KSh ${amount.toLocaleString()} has been sent to your M-Pesa. Repay on time to build your credit.`,
    );
  }

  async sendPaymentReceived(phone: string, amount: number): Promise<boolean> {
    return this.send(
      phone,
      `GETON: Payment of KSh ${amount.toLocaleString()} received. Thank you!`,
    );
  }

  async sendPaymentReminder(
    phone: string,
    amount: number,
    dueDate: string,
  ): Promise<boolean> {
    return this.send(
      phone,
      `GETON reminder: Your repayment of KSh ${amount.toLocaleString()} is due on ${dueDate}. Pay via M-Pesa to avoid penalties.`,
    );
  }
}

export const sms = new SmsService();
