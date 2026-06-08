// Number formatting utilities
export const centsToKes = (cents: number) => Math.round(cents);
export const kesToCents = (kes: number) => Math.round(kes * 100);
export const formatKes = (amount: number, withSymbol = true) => {
  const formatted = new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return withSymbol ? `KSh ${formatted}` : formatted;
};

export const formatPhone = (phone: string): string => {
  // Convert 07XX/01XX/+254XXX to 254XXXXXXXXX
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
  if (cleaned.startsWith("0")) cleaned = "254" + cleaned.slice(1);
  if (!cleaned.startsWith("254")) cleaned = "254" + cleaned;
  return cleaned;
};

export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s\-\+\(\)]/g, "");
  // Kenyan numbers: 254XXXXXXXXX (12 digits) or 07XXXXXXXX (10 digits)
  return /^(?:2547\d{8}|2541\d{8}|07\d{8}|01\d{8})$/.test(cleaned);
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidNationalId = (id: string): boolean => {
  return /^\d{7,9}$/.test(id);
};

export const isValidKraPin = (pin: string): boolean => {
  return /^[A-Z]\d{9}[A-Z]$/i.test(pin);
};

export const isValidPassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

export const isValidPin = (pin: string): boolean => {
  return /^\d{4}$/.test(pin);
};

export const genRef = (prefix = "GTN"): string => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${ts}${rand}`;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Compute the activation fee for a loan amount using tier table.
 * Fee always ends in 99 for psychological pricing.
 */
export function computeActivationFee(amount: number): number {
  // Find tier in config (imported elsewhere to avoid circular dep)
  const tier = (configAny.loan.activationFees as any[]).find(
    (t) => amount >= t.min && amount <= t.max,
  );
  return tier?.total ?? 4999;
}

// We re-import config dynamically to avoid circular dep at module load
import { config as configAny } from "./config.js";

/**
 * Determine the interest rate for a given user based on KYC tier & history.
 *
 * Tier-based pricing (LOWEST in Kenya — 12% APR base):
 *   - Default:                 1.0% / month (12% APR) — base rate
 *   - KYC Tier 3 (KRA PIN):    0.8% / month (9.6% APR)
 *   - VIP (5+ repaid loans):   0.5% / month (6% APR) — our BEST
 *
 * First-loan bonus: New customers get an EXTRA 0.1% off their tier rate
 * for their first 3 loans, to encourage onboarding.
 */
export function getInterestRateForUser(user: {
  kycLevel?: number;
  repaidLoansCount?: number;
  isFirstLoan?: boolean;
}): number {
  const baseRate = configAny.loan.interestRate; // 1% / month
  const premiumRate = (configAny.loan as any).interestRatePremium; // 0.8% / month
  const vipRate = (configAny.loan as any).interestRateVip; // 0.5% / month

  let rate = baseRate;
  if (user.kycLevel === 3) {
    rate = premiumRate;
  }

  // VIP — 5+ successfully repaid loans (overrides premium)
  if ((user.repaidLoansCount ?? 0) >= 5) {
    rate = vipRate;
  }

  // First-loan bonus: -0.1% off (min 0.3%)
  if (user.isFirstLoan && (user.repaidLoansCount ?? 0) === 0) {
    rate = Math.max(0.3, rate - 0.1);
  }

  return rate;
}

/**
 * Compute full loan terms with tier-based interest rate.
 */
export function computeLoanTerms(
  amount: number,
  tenure: number,
  userContext?: {
    kycLevel?: number;
    repaidLoansCount?: number;
    isFirstLoan?: boolean;
  },
) {
  if (amount < configAny.loan.minAmount || amount > configAny.loan.maxAmount) {
    throw new Error(
      `Amount must be between KSh ${configAny.loan.minAmount} and ${configAny.loan.maxAmount}`,
    );
  }
  if (
    tenure < configAny.loan.minTenure ||
    tenure > configAny.loan.maxTenure
  ) {
    throw new Error(
      `Tenure must be between ${configAny.loan.minTenure} and ${configAny.loan.maxTenure} months`,
    );
  }

  // Use tier-based rate if user context is provided
  const interestRate = userContext
    ? getInterestRateForUser(userContext)
    : configAny.loan.interestRate;

  const monthlyRate = interestRate / 100;
  const totalInterest = Math.round(amount * monthlyRate * tenure);
  const totalRepayment = amount + totalInterest;
  const monthlyPayment = Math.round(totalRepayment / tenure);
  const activationFee = computeActivationFee(amount);

  return {
    amount,
    tenure,
    interestRate,
    monthlyRate,
    totalInterest,
    totalRepayment,
    monthlyPayment,
    activationFee,
    // Savings vs industry average (15% per month)
    savedVsIndustry: Math.round(amount * 0.15 * tenure) - totalInterest,
  };
}

export const sanitizeUser = <T extends Record<string, any>>(user: T) => {
  const { passwordHash, pinHash, ...safe } = user as any;
  return safe;
};
