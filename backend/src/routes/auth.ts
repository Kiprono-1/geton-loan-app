import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { strictRateLimit, loginSlowDown } from "../middleware/rateLimit.js";
import * as auth from "../controllers/auth.js";

const router = Router();

router.post(
  "/register",
  strictRateLimit,
  validate(auth.registerSchema),
  auth.register,
);
router.post(
  "/login",
  loginSlowDown,
  strictRateLimit,
  validate(auth.loginSchema),
  auth.login,
);
router.post("/refresh", strictRateLimit, validate(auth.refreshSchema), auth.refresh);
router.post("/logout", requireAuth, auth.logout);
router.post("/forgot-password", strictRateLimit, auth.forgotPassword);
router.post("/reset-password", strictRateLimit, auth.resetPassword);

router.post(
  "/change-password",
  requireAuth,
  validate(auth.changePasswordSchema),
  auth.changePassword,
);
router.post("/pin", requireAuth, validate(auth.setPinSchema), auth.setPin);

router.post("/phone/send-otp", requireAuth, strictRateLimit, auth.sendPhoneOtp);
router.post(
  "/phone/verify",
  requireAuth,
  strictRateLimit,
  validate(auth.verifyPhoneSchema),
  auth.verifyPhone,
);

export default router;
