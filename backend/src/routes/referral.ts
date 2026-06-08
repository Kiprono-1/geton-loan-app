import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as referral from "../controllers/referral.js";

const router = Router();

router.get("/", requireAuth, referral.getReferralInfo);

export default router;
