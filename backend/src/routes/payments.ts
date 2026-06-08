import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { audit } from "../middleware/audit.js";
import { paymentRateLimit } from "../middleware/rateLimit.js";
import * as payments from "../controllers/payments.js";

const router = Router();

router.post(
  "/activation",
  requireAuth,
  paymentRateLimit,
  audit("payment.activation", "PaymentIntent"),
  validate(payments.initiateActivationPaymentSchema),
  payments.initiateActivationPayment,
);

router.post(
  "/verify",
  requireAuth,
  paymentRateLimit,
  validate(payments.verifyPaymentSchema),
  payments.verifyPayment,
);

export default router;
