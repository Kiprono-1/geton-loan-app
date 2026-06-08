import { Router } from "express";
import { paystackWebhook } from "../controllers/payments.js";

const router = Router();

/**
 * Paystack webhook endpoint.
 * IMPORTANT: This route uses express.raw() in the main app to
 * preserve the raw body for signature verification.
 */
router.post("/paystack", paystackWebhook);

export default router;
