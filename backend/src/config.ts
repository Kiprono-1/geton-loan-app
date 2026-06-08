import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

function required(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function int(key: string, fallback: number): number {
  const value = process.env[key];
  if (!value) return fallback;
  const n = parseInt(value, 10);
  if (isNaN(n)) throw new Error(`Invalid integer for ${key}: ${value}`);
  return n;
}

export const config = {
  env: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  port: int("PORT", 3000),
  apiUrl: required("API_URL", "http://localhost:3000"),
  frontendUrl: required("FRONTEND_URL", "http://localhost:5173"),
  logLevel: process.env.LOG_LEVEL || "info",

  db: {
    url: required("DATABASE_URL", "file:./dev.db"),
  },

  jwt: {
    secret: required("JWT_SECRET", "dev-secret-change-me-in-prod"),
    refreshSecret: required("JWT_REFRESH_SECRET", "dev-refresh-secret-change-me-in-prod"),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "30d",
  },

  paystack: {
    secretKey: required("PAYSTACK_SECRET_KEY", "sk_test_placeholder"),
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || "pk_test_placeholder",
    webhookSecret:
      process.env.PAYSTACK_WEBHOOK_SECRET || "paystack_webhook_secret",
  },

  daraja: {
    consumerKey: process.env.DARAJA_CONSUMER_KEY || "",
    consumerSecret: process.env.DARAJA_CONSUMER_SECRET || "",
    shortcode: process.env.DARAJA_SHORTCODE || "174379",
    passkey: process.env.DARAJA_PASSKEY || "",
  },

  sms: {
    apiKey: process.env.AT_API_KEY || "",
    username: process.env.AT_USERNAME || "sandbox",
    senderId: process.env.AT_SENDER_ID || "GETON",
  },

  // ============================================================
  // LOAN PRODUCT CONFIGURATION
  // ============================================================
  loan: {
    minAmount: 2_500, // KSh
    maxAmount: 250_000, // KSh
    minTenure: 1, // months
    maxTenure: 12, // months

    // ===========================================================
    // INTEREST RATES — 12% per YEAR (1% per month)
    // The LOWEST annual rate among Kenyan digital lenders:
    //   - GETON:    1% / month = 12% APR  ⭐ LOWEST
    //   - M-Shwari: 7.5% / month = 90% APR
    //   - Fuliza:   10% / month = 120% APR
    //   - Tala:     15% / month = 180% APR
    //   - Branch:   12% / month = 144% APR
    // ===========================================================
    annualInterestRate: 12, // % per year
    interestRate: 1, // % per month flat (base rate) — 12% APR
    interestRatePremium: 0.8, // KYC Tier 3 (KRA PIN) — 9.6% APR
    interestRateVip: 0.5, // 5+ repaid loans — 6% APR (our BEST)
    latePenaltyRate: 3, // % of overdue amount (after grace period)
    gracePeriodDays: 3, // 3-day grace period before penalty kicks in

    // ===========================================================
    // ACTIVATION FEE TIERS (all in whole KSh, end in 99)
    // Lowest fee is KSh 500 for the smallest loans.
    // Covers KYC verification, processing, insurance, CRB check.
    // ===========================================================
    activationFees: [
      { min: 2_500, max: 5_000, total: 500 },        // 10-20% — KSh 500 minimum
      { min: 5_001, max: 10_000, total: 799 },       // 8-16%
      { min: 10_001, max: 20_000, total: 1_299 },     // 6.5-13%
      { min: 20_001, max: 35_000, total: 1_999 },     // 5.7-10%
      { min: 35_001, max: 50_000, total: 2_799 },     // 5.6-8%
      { min: 50_001, max: 75_000, total: 3_999 },     // 5.3-8%
      { min: 75_001, max: 100_000, total: 5_499 },    // 5.5-7.3%
      { min: 100_001, max: 150_000, total: 7_999 },   // 5.3-8%
      { min: 150_001, max: 200_000, total: 11_999 },  // 6-8%
      { min: 200_001, max: 250_000, total: 15_000 },  // 6% — ⭐ MAX
    ],
  },
};

export type Config = typeof config;
