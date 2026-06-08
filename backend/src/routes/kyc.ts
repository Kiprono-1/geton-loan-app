import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { audit } from "../middleware/audit.js";
import { kycRateLimit } from "../middleware/rateLimit.js";
import * as kyc from "../controllers/kyc.js";

const router = Router();

router.get("/", requireAuth, kyc.getKyc);
router.post(
  "/",
  requireAuth,
  kycRateLimit,
  audit("kyc.submit", "KYC"),
  validate(kyc.submitKycSchema),
  kyc.submitKyc,
);
router.post(
  "/upload",
  requireAuth,
  kycRateLimit,
  audit("kyc.upload", "KYC"),
  validate(kyc.uploadDocSchema),
  kyc.uploadDocument,
);

export default router;
