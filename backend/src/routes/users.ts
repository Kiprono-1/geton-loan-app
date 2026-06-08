import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import * as user from "../controllers/user.js";

const router = Router();

router.get("/me", requireAuth, user.getMe);
router.patch(
  "/me",
  requireAuth,
  validate(user.updateProfileSchema),
  user.updateProfile,
);
router.get("/me/stats", requireAuth, user.getStats);
router.get("/me/devices", requireAuth, user.getDevices);
router.delete("/me/devices/:id", requireAuth, user.revokeDevice);

export default router;
