import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { paystack } from "../services/paystack.js";
import { notifications } from "../services/notifications.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors.js";
import { config } from "../config.js";
import { formatPhone, genRef, isValidPhone } from "../utils.js";
import { logger } from "../logger.js";

export const withdrawSchema = z.object({
  amount: z.number().int().positive(),
  phone: z.string().min(10).optional(),
  destination: z.enum(["mpesa", "bank"]).default("mpesa"),
});

export const depositSchema = z.object({
  amount: z.number().int().positive(),
  phone: z.string().min(10),
});

/**
 * GET /api/v1/wallet
 */
export async function getWallet(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { walletBalance: true },
  });
  if (!user) throw new UnauthorizedError();
  res.json({ success: true, data: { balance: user.walletBalance } });
}

/**
 * POST /api/v1/wallet/withdraw
 * Withdraw from wallet to M-Pesa via Paystack B2C.
 */
export async function withdraw(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { amount, phone: rawPhone, destination = "mpesa" } = req.body as z.infer<
    typeof withdrawSchema
  >;

  if (amount < 100) throw new BadRequestError("Minimum withdrawal is KSh 100");

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: { kyc: true },
  });
  if (!user) throw new UnauthorizedError();

  if (user.walletBalance < amount) {
    throw new BadRequestError("Insufficient balance");
  }

  const phone = rawPhone ? formatPhone(rawPhone) : user.kyc?.mpesaNumber || user.phone;
  if (destination === "mpesa" && !isValidPhone(phone)) {
    throw new BadRequestError("Invalid M-Pesa number");
  }

  // Debit wallet first (refund on failure)
  await prisma.user.update({
    where: { id: user.id },
    data: { walletBalance: { decrement: amount } },
  });

  const reference = genRef("WDL");
  try {
    const recipient = await paystack.createTransferRecipient({
      name: user.fullName,
      phone,
    });
    const transfer = await paystack.initiateTransfer({
      amount,
      recipientCode: recipient.recipientCode,
      reason: `GETON wallet withdrawal`,
      reference,
    });

    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "withdrawal",
        description: `Withdrawal to ${destination === "mpesa" ? "M-Pesa" : "bank"}`,
        amount,
        status: "pending",
        reference,
        channel: "mpesa-b2c",
      },
    });

    res.json({
      success: true,
      data: {
        reference,
        transferCode: transfer.transferCode,
        message: "Withdrawal initiated. You'll receive funds within minutes.",
      },
    });
  } catch (err: any) {
    // Refund wallet on failure
    await prisma.user.update({
      where: { id: user.id },
      data: { walletBalance: { increment: amount } },
    });
    logger.error({ err, userId: user.id }, "Withdrawal failed");
    throw new BadRequestError(err.message);
  }
}

/**
 * POST /api/v1/wallet/deposit
 * Top up wallet from M-Pesa (via STK push).
 */
export async function deposit(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { amount, phone: rawPhone } = req.body as z.infer<typeof depositSchema>;
  if (!isValidPhone(rawPhone)) throw new BadRequestError("Invalid M-Pesa number");
  if (amount < 10) throw new BadRequestError("Minimum deposit is KSh 10");

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });
  if (!user) throw new UnauthorizedError();

  const phone = formatPhone(rawPhone);
  const reference = genRef("DEP");
  const intent = await prisma.paymentIntent.create({
    data: {
      userId: user.id,
      amount,
      type: "deposit",
      reference,
      phone,
      status: "pending",
    },
  });

  try {
    const result = await paystack.chargeMpesaSTK({
      amount,
      email: user.email,
      phone,
      reference,
      metadata: {
        intentId: intent.id,
        userId: user.id,
        type: "deposit",
      },
      callbackUrl: `${config.apiUrl}/api/v1/webhooks/paystack`,
    });

    await prisma.paymentIntent.update({
      where: { id: intent.id },
      data: {
        paystackRef: result.reference,
        status: "processing",
        authorizationUrl: result.authorizationUrl,
      },
    });

    res.json({
      success: true,
      data: {
        reference,
        message: "M-Pesa prompt sent. Enter PIN to top up your wallet.",
      },
    });
  } catch (err: any) {
    await prisma.paymentIntent.update({
      where: { id: intent.id },
      data: { status: "failed", failureReason: err.message },
    });
    throw err;
  }
}
