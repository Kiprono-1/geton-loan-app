import { Router } from "express";
import authRoutes from "./auth.js";
import userRoutes from "./users.js";
import loanRoutes from "./loans.js";
import paymentRoutes from "./payments.js";
import kycRoutes from "./kyc.js";
import walletRoutes from "./wallet.js";
import transactionRoutes from "./transactions.js";
import notificationRoutes from "./notifications.js";
import referralRoutes from "./referral.js";
import webhookRoutes from "./webhooks.js";
import { apiRateLimit, webhookRateLimit } from "../middleware/rateLimit.js";
import { config } from "../config.js";

const router = Router();

// Webhooks first — they're special (need raw body, lenient rate limit)
router.use("/webhooks", webhookRateLimit, webhookRoutes);

// Apply general rate limit to everything else
router.use(apiRateLimit);

// Health check
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "geton-api",
      env: config.env,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  });
});

// Versioned API routes
router.use("/v1/auth", authRoutes);
router.use("/v1/users", userRoutes);
router.use("/v1/loans", loanRoutes);
router.use("/v1/payments", paymentRoutes);
router.use("/v1/kyc", kycRoutes);
router.use("/v1/wallet", walletRoutes);
router.use("/v1/transactions", transactionRoutes);
router.use("/v1/notifications", notificationRoutes);
router.use("/v1/referrals", referralRoutes);

export default router;
