import type { Request, Response } from "express";
import { prisma } from "../db.js";
import { UnauthorizedError } from "../errors.js";
import { notifications as notifService } from "../services/notifications.js";

export async function listNotifications(
  req: Request,
  res: Response,
): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { unreadOnly } = req.query as { unreadOnly?: string };

  const items = await prisma.notification.findMany({
    where: {
      userId: req.user.userId,
      ...(unreadOnly === "true" ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unread = await notifService.getUnreadCount(req.user.userId);

  res.json({ success: true, data: { items, unread } });
}

export async function markRead(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const { id } = req.params;
  await prisma.notification.updateMany({
    where: { id, userId: req.user.userId },
    data: { isRead: true, readAt: new Date() },
  });
  res.json({ success: true });
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new UnauthorizedError();
  const count = await notifService.markAllRead(req.user.userId);
  res.json({ success: true, data: { count } });
}
