import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as notifications from "../controllers/notifications.js";

const router = Router();

router.get("/", requireAuth, notifications.listNotifications);
router.post("/:id/read", requireAuth, notifications.markRead);
router.post("/read-all", requireAuth, notifications.markAllRead);

export default router;
