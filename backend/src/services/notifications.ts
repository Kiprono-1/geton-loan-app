import { prisma } from "../db.js";
import { logger } from "../logger.js";
import { sms } from "./sms.js";
import type { NotificationCategory, NotificationType } from "../types.js";

export class NotificationService {
  async create(
    userId: string,
    data: {
      title: string;
      message: string;
      type?: NotificationType;
      category?: NotificationCategory;
      link?: string;
      sendSms?: boolean;
      smsMessage?: string;
    },
  ) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title: data.title,
          message: data.message,
          type: data.type ?? "info",
          category: data.category,
          link: data.link,
        },
      });

      // Optionally send SMS
      if (data.sendSms) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { phone: true },
        });
        if (user && data.smsMessage) {
          await sms.send(user.phone, data.smsMessage);
        }
      }

      return notification;
    } catch (err) {
      logger.error({ err, userId, data }, "Failed to create notification");
      throw err;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count;
  }
}

export const notifications = new NotificationService();
