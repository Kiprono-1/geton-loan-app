import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { paystack } from "../services/paystack.js";
import { notifications } from "../services/notifications.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../errors.js";
import { config } from "../config.js";
import { logger } from "../logger.js";
import { computeLoanTerms, formatKes, genRef } from "../utils.js";

// =============== Validation schemas ===============

export const applyLoanSchema = z.object({
  amount: z.number().int().min(config.loan.minAmount).max(config.loan.maxAmount),
  tenure: z.number().int().min(config.loan.minTenure).max(config.loan.maxTenure),
  purpose: z.string().min(2).max(100),
});

export const calculateSchema = z.object({
  amount: z.number().int().positive(),
  tenure: z.number().int().positive(),
});

// =============== Handlers ===============

/**
 * POST /api/v1/loans/apply
 * Customer applies for a loan. Returns loan with computed terms.
 * Loan is created in "pending" status, then immediately moved to "fees-required"
 * once the customer is ready to pay.
 */
export async function applyForLoan(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { amount, tenure, purpose } = req.body as z.infer<typeof applyLoanSchema>;

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
  });
  if (!user) throw new UnauthorizedError();
  if (!user.isActive || user.isBlocked) {
    throw new ForbiddenError("Account is not active");
  }

  // Check if user has an active loan
  const activeLoan = await prisma.loan.findFirst({
    where: {
      userId: user.id,
      status: { in: ["pending", "fees-required", "approved", "active"] },
    },
  });
  if (activeLoan) {
    throw new BadRequestError(
      "You already have an active loan. Repay it first before applying for a new one.",
    );
  }

  // Credit scoring — basic heuristic
  let creditApproved = true;
  let rejectionReason: string | undefined;

  if (amount > user.loanLimit) {
    creditApproved = false;
    rejectionReason = `Requested amount exceeds your limit of KSh ${user.loanLimit.toLocaleString()}. Complete KYC to increase your limit.`;
  } else if (user.creditScore > 0 && user.creditScore < 500) {
    creditApproved = false;
    rejectionReason = "Credit score too low. Build your score by repaying previous loans on time.";
  }

  // Count previously repaid loans (to determine VIP rate eligibility)
  const repaidLoansCount = await prisma.loan.count({
    where: { userId: user.id, status: "repaid" },
  });
  const activeLoansCount = await prisma.loan.count({
    where: {
      userId: user.id,
      status: { in: ["pending", "fees-required", "approved", "active"] },
    },
  });
  const isFirstLoan = repaidLoansCount === 0 && activeLoansCount === 0;

  // Compute terms with tier-based pricing
  const terms = computeLoanTerms(amount, tenure, {
    kycLevel: user.kycLevel,
    repaidLoansCount,
    isFirstLoan,
  });

  if (!creditApproved) {
    // Auto-reject
    const rejected = await prisma.loan.create({
      data: {
        userId: user.id,
        amount,
        tenure,
        purpose,
        interestRate: terms.interestRate,
        monthlyPayment: terms.monthlyPayment,
        totalInterest: terms.totalInterest,
        totalRepayment: terms.totalRepayment,
        amountRemaining: 0,
        status: "rejected",
        rejectionReason,
        activationFeePaid: false,
      },
    });
    await notifications.create(user.id, {
      title: "Loan application declined",
      message: rejectionReason!,
      type: "warning",
      category: "loan",
    });
    res.status(400).json({
      success: false,
      error: {
        code: "LOAN_REJECTED",
        message: rejectionReason,
        data: rejected,
      },
    });
    return;
  }

  // Approve and create loan
  const loan = await prisma.loan.create({
    data: {
      userId: user.id,
      amount,
      tenure,
      purpose,
      interestRate: terms.interestRate,
      monthlyPayment: terms.monthlyPayment,
      totalInterest: terms.totalInterest,
      totalRepayment: terms.totalRepayment,
      amountRemaining: terms.totalRepayment,
      activationFee: terms.activationFee,
      status: "fees-required",
      activationFeePaid: false,
    },
  });

  // Notify user with the favorable rate highlighted
  const rateLabel = isFirstLoan
    ? `🎉 New customer rate: ${terms.interestRate}% / month!`
    : terms.interestRate <= 3
      ? `⭐ Premium rate: ${terms.interestRate}% / month!`
      : `Rate: ${terms.interestRate}% / month`;

  await notifications.create(user.id, {
    title: "Loan pre-approved! 🎉",
    message: `Your loan of KSh ${amount.toLocaleString()} is pre-approved at ${terms.interestRate}%/month. Pay KSh ${terms.activationFee.toLocaleString()} activation fee to receive funds instantly.`,
    type: "success",
    category: "loan",
    sendSms: true,
    smsMessage: `GETON: Loan of KSh ${amount.toLocaleString()} approved at ${terms.interestRate}%/month! Pay KSh ${terms.activationFee.toLocaleString()} activation fee to receive funds.`,
  });

  // Tell them about savings
  if (terms.savedVsIndustry > 0) {
    await notifications.create(user.id, {
      title: `You save KSh ${terms.savedVsIndustry.toLocaleString()}! 💰`,
      message: `By choosing GETON at ${terms.interestRate}%/month, you save KSh ${terms.savedVsIndustry.toLocaleString()} compared to industry average of 15%/month.`,
      type: "info",
      category: "loan",
    });
  }

  logger.info({ userId: user.id, loanId: loan.id, amount }, "Loan created");

  res.status(201).json({
    success: true,
    data: {
      loan,
      terms: {
        ...terms,
        formatted: {
          amount: formatKes(terms.amount),
          monthlyPayment: formatKes(terms.monthlyPayment),
          totalRepayment: formatKes(terms.totalRepayment),
          totalInterest: formatKes(terms.totalInterest),
          activationFee: formatKes(terms.activationFee),
        },
      },
    },
  });
}

/**
 * POST /api/v1/loans/calculate
 * Just compute terms without creating a loan. Used by the slider UI.
 * If authenticated, shows the user's personalized tier-based rate.
 */
export async function calculate(req: Request, res: Response): Promise<void> {
  const { amount, tenure } = req.body as z.infer<typeof calculateSchema>;
  if (amount < config.loan.minAmount || amount > config.loan.maxAmount) {
    throw new BadRequestError(
      `Amount must be between KSh ${config.loan.minAmount} and KSh ${config.loan.maxAmount}`,
    );
  }
  if (tenure < config.loan.minTenure || tenure > config.loan.maxTenure) {
    throw new BadRequestError(
      `Tenure must be between ${config.loan.minTenure} and ${config.loan.maxTenure} months`,
    );
  }

  // If authenticated, use tier-based rate
  let terms;
  if (req.user) {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });
    if (user) {
      const repaidLoansCount = await prisma.loan.count({
        where: { userId: user.id, status: "repaid" },
      });
      const activeLoansCount = await prisma.loan.count({
        where: {
          userId: user.id,
          status: { in: ["pending", "fees-required", "approved", "active"] },
        },
      });
      terms = computeLoanTerms(amount, tenure, {
        kycLevel: user.kycLevel,
        repaidLoansCount,
        isFirstLoan: repaidLoansCount === 0 && activeLoansCount === 0,
      });
    } else {
      terms = computeLoanTerms(amount, tenure);
    }
  } else {
    terms = computeLoanTerms(amount, tenure);
  }
  res.json({ success: true, data: terms });
}

/**
 * GET /api/v1/loans
 * List user's loans
 */
export async function listLoans(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const loans = await prisma.loan.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: "desc" },
    include: {
      fees: true,
      payments: true,
    },
  });
  res.json({ success: true, data: loans });
}

/**
 * GET /api/v1/loans/:id
 * Get single loan
 */
export async function getLoan(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { id } = req.params;
  const loan = await prisma.loan.findFirst({
    where: { id, userId: req.user.userId },
    include: { fees: true, payments: true },
  });
  if (!loan) throw new NotFoundError("Loan not found");
  res.json({ success: true, data: loan });
}

/**
 * POST /api/v1/loans/:id/disburse
 * Trigger B2C disbursement to user's M-Pesa.
 * Called automatically by the webhook when the activation fee is paid.
 */
export async function disburseLoan(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { id } = req.params;

  const loan = await prisma.loan.findFirst({
    where: { id, userId: req.user.userId },
    include: { user: { include: { kyc: true } } },
  });
  if (!loan) throw new NotFoundError("Loan not found");
  if (!loan.activationFeePaid) {
    throw new BadRequestError("Activation fee not paid");
  }
  if (loan.status === "active") {
    throw new BadRequestError("Loan already disbursed");
  }
  if (loan.status !== "approved" && loan.status !== "fees-required") {
    throw new BadRequestError(`Cannot disburse loan in status: ${loan.status}`);
  }

  const kyc = loan.user.kyc;
  const mpesaNumber = kyc?.mpesaNumber || loan.user.phone;

  // Create transfer recipient + initiate B2C
  const ref = genRef("DISB");
  try {
    const recipient = await paystack.createTransferRecipient({
      name: loan.user.fullName,
      phone: mpesaNumber,
    });
    const transfer = await paystack.initiateTransfer({
      amount: loan.amount,
      recipientCode: recipient.recipientCode,
      reason: `Loan disbursement for ${loan.id}`,
      reference: ref,
    });

    // Update loan with disbursement ref
    await prisma.loan.update({
      where: { id: loan.id },
      data: {
        status: "approved",
        disbursementRef: ref,
      },
    });

    res.json({
      success: true,
      data: {
        transferCode: transfer.transferCode,
        status: transfer.status,
        message: "Disbursement initiated. You'll receive the funds within minutes.",
      },
    });
  } catch (err: any) {
    logger.error({ err, loanId: id }, "Disbursement failed");
    throw new BadRequestError(
      `Disbursement failed: ${err.message}. Our team will retry.`,
    );
  }
}

/**
 * POST /api/v1/loans/:id/repay
 * Initiate M-Pesa STK push to collect a loan repayment.
 */
export async function initiateRepayment(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { id } = req.params;
  const { phone: rawPhone, amount } = req.body as {
    phone: string;
    amount: number;
  };

  if (!rawPhone) throw new BadRequestError("Phone required");
  if (!amount || amount < 100) throw new BadRequestError("Invalid amount");

  const loan = await prisma.loan.findFirst({
    where: { id, userId: req.user.userId },
    include: { user: true },
  });
  if (!loan) throw new NotFoundError("Loan not found");
  if (loan.status !== "active") {
    throw new BadRequestError("Loan is not active");
  }
  if (amount > loan.amountRemaining) {
    throw new BadRequestError(
      `Amount exceeds remaining balance of KSh ${loan.amountRemaining.toLocaleString()}`,
    );
  }

  const phone = formatPhone(rawPhone);
  const reference = genRef("REP");
  const intent = await prisma.paymentIntent.create({
    data: {
      userId: loan.userId,
      amount,
      type: "loan-repayment",
      reference,
      phone,
      status: "pending",
      metadata: JSON.stringify({ loanId: loan.id }),
    },
  });

  try {
    const result = await paystack.chargeMpesaSTK({
      amount,
      email: loan.user.email,
      phone,
      reference,
      metadata: {
        intentId: intent.id,
        userId: loan.userId,
        loanId: loan.id,
        type: "loan-repayment",
      },
      callbackUrl: `${config.apiUrl}/api/v1/webhooks/paystack`,
    });

    await prisma.paymentIntent.update({
      where: { id: intent.id },
      data: {
        paystackRef: result.reference,
        authorizationUrl: result.authorizationUrl,
        accessCode: result.accessCode,
        status: "processing",
      },
    });

    await notifications.create(loan.userId, {
      title: "Repayment prompt sent",
      message: `Enter your M-Pesa PIN to pay KSh ${amount.toLocaleString()}.`,
      type: "info",
      category: "payment",
      sendSms: true,
      smsMessage: `GETON: M-Pesa prompt for KSh ${amount.toLocaleString()} repayment. Enter PIN to confirm.`,
    });

    res.json({
      success: true,
      data: {
        intentId: intent.id,
        reference,
        status: result.status,
        message: "M-Pesa STK push sent. Enter your PIN to confirm.",
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

/**
 * POST /api/v1/loans/:id/cancel
 * Cancel a pending loan (only allowed if not yet disbursed).
 */
export async function cancelLoan(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { id } = req.params;
  const loan = await prisma.loan.findFirst({
    where: { id, userId: req.user.userId },
  });
  if (!loan) throw new NotFoundError("Loan not found");
  if (!["pending", "fees-required", "rejected"].includes(loan.status)) {
    throw new BadRequestError("Cannot cancel an active or disbursed loan");
  }
  await prisma.loan.update({
    where: { id: loan.id },
    data: { status: "cancelled" },
  });
  res.json({ success: true });
}
