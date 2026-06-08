export const formatCurrency = (amount: number, currency = "KSh ") => {
  return `${currency}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (date: string | Date) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (date: string | Date) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatRelative = (date: string | Date) => {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diff = now - d.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
};

export const genRef = (prefix = "GTN") => {
  return `${prefix}${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
};

/**
 * Tier-based activation fee. All amounts in whole KSh, end in 99.
 * Internally split into 3 components for the breakdown display, but client
 * pays the TOTAL as a single payment.
 *
 * The minimum loan is KSh 2,500 → activation fee is KSh 500 (the lowest).
 * Internal split: 50% processing, 33% insurance, 17% verification.
 */
const FEE_TIERS: Array<{
  min: number;
  max: number;
  total: number;
  proc: number;
  ins: number;
  ver: number;
}> = [
  { min: 2_500, max: 5_000, total: 500, proc: 250, ins: 175, ver: 75 },          // 10-20% — MIN
  { min: 5_001, max: 10_000, total: 799, proc: 399, ins: 275, ver: 125 },       // 8-16%
  { min: 10_001, max: 20_000, total: 1_299, proc: 649, ins: 449, ver: 201 },     // 6.5-13%
  { min: 20_001, max: 35_000, total: 1_999, proc: 999, ins: 699, ver: 301 },     // 5.7-10%
  { min: 35_001, max: 50_000, total: 2_799, proc: 1_399, ins: 999, ver: 401 },   // 5.6-8%
  { min: 50_001, max: 75_000, total: 3_999, proc: 1_999, ins: 1_399, ver: 601 },  // 5.3-8%
  { min: 75_001, max: 100_000, total: 5_499, proc: 2_749, ins: 1_999, ver: 751 }, // 5.5-7.3%
  { min: 100_001, max: 150_000, total: 7_999, proc: 3_999, ins: 2_799, ver: 1_201 }, // 5.3-8%
  { min: 150_001, max: 200_000, total: 11_999, proc: 5_999, ins: 4_199, ver: 1_801 }, // 6-8%
  { min: 200_001, max: 250_000, total: 15_000, proc: 7_499, ins: 5_299, ver: 2_202 }, // 6% — MAX
];

export const MIN_LOAN = 2_500;
export const MAX_LOAN = 250_000;
export const MIN_FEE = 500; // KSh 500 minimum
export const MAX_FEE = 15_000; // KSh 250,000 = KSh 15,000 activation fee

export const computeActivationFee = (amount: number) => {
  const tier =
    FEE_TIERS.find((t) => amount >= t.min && amount <= t.max) ??
    FEE_TIERS[FEE_TIERS.length - 1];
  return {
    activationFee: tier.total,
    processingFee: tier.proc,
    insuranceFee: tier.ins,
    verificationFee: tier.ver,
  };
};

/**
 * Tier-based interest rate calculator for the frontend.
 * Used for previews when user context is known.
 *
 * LOWEST rates in Kenya: 12% APR base, 9.6% Premium, 6% VIP.
 */
export interface UserContext {
  kycLevel?: number;
  repaidLoansCount?: number;
  isFirstLoan?: boolean;
}

export const getInterestRateForUser = (user: UserContext = {}): number => {
  // 12% APR base = 1% per month
  const baseRate = 1; // 1% / month (12% APR)
  const premiumRate = 0.8; // KYC Tier 3 (9.6% APR)
  const vipRate = 0.5; // 5+ repaid loans (6% APR) — our BEST

  let rate = baseRate;
  if (user.kycLevel === 3) rate = premiumRate;
  if ((user.repaidLoansCount ?? 0) >= 5) rate = vipRate;
  if (user.isFirstLoan && (user.repaidLoansCount ?? 0) === 0) {
    rate = Math.max(0.3, rate - 0.1); // first-loan bonus: -0.1% off
  }
  return rate;
};

/**
 * Compute loan terms based on amount + tenure.
 *
 * FAVORABLE RATE STRATEGY (12% APR base — lowest in Kenya):
 *   - Default: 1% / month (12% APR) — best base rate in Kenya
 *   - Premium (KYC Tier 3): 0.8% / month (9.6% APR)
 *   - VIP (5+ repaid loans): 0.5% / month (6% APR) — our LOWEST
 *   - First-loan bonus: -0.1% off (so 0.9% / 0.7% / 0.4%)
 *
 * Compare to industry (monthly rates):
 *   - GETON:   1.0%  (12% APR) ⭐ LOWEST
 *   - M-Shwari: 7.5% (90% APR)
 *   - Fuliza:   10%  (120% APR)
 *   - Tala:     15%  (180% APR)
 *   - Branch:   12%  (144% APR)
 *   - Bank:     13-18% (156-216% APR)
 */
export const computeLoan = (
  amount: number,
  tenure: number,
  userContext: UserContext = {},
) => {
  const interestRate = getInterestRateForUser(userContext) / 100; // e.g. 0.01
  const totalInterest = Math.round(amount * interestRate * tenure);
  const totalRepayment = amount + totalInterest;
  const monthlyPayment = Math.round(totalRepayment / tenure);

  const fees = computeActivationFee(amount);

  // Compare to industry average (15% per month = 180% APR) for savings message
  const industryInterest = Math.round(amount * 0.15 * tenure);
  const savedVsIndustry = industryInterest - totalInterest;

  return {
    interestRate: interestRate * 100,
    totalInterest,
    totalRepayment,
    monthlyPayment,
    savedVsIndustry,
    ...fees,
    totalRequiredFees: fees.activationFee, // for backward compat
  };
};
