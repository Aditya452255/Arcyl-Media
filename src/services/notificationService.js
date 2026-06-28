import { NotificationRepository } from "../repositories/notificationRepository";
import prisma from "../config/db";
import resend from "../config/resend";
import { env } from "../config/env";
import logger from "../utils/logger";

export class NotificationService {
  /**
   * Dispatches in-app notification and email to specific user
   */
  static async notifyUser(userId, title, message, type) {
    const notification = await NotificationRepository.create({
      userId,
      title,
      message,
      type,
    });

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.email && resend) {
        await resend.emails.send({
          from: env.EMAIL_FROM || "Arcyl Media <notifications@arcylmedia.com>",
          to: user.email,
          subject: `[Arcyl Media Alert] ${title}`,
          html: `<div style="font-family: sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 600px; margin: auto;">
            <h2 style="color: #6366f1; margin-top: 0;">${title}</h2>
            <p style="font-size: 16px; line-height: 1.5;">${message}</p>
            <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 24px 0;" />
            <small style="color: #64748b; font-size: 12px; display: block; text-align: center;">This is an automated notification from your Agency OS dashboard.</small>
          </div>`,
        });
      }
    } catch (err) {
      logger.error({ err, userId }, "Failed to send email alert for notification");
    }

    return notification;
  }

  /**
   * Broadcasts operational alert to all system users
   */
  static async notifyAll(title, message, type) {
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    const notifications = await Promise.all(
      users.map((u) => this.notifyUser(u.id, title, message, type))
    );
    return notifications;
  }

  /**
   * Fetches user alerts
   */
  static async getNotificationsForUser(userId, filters) {
    const [total, data] = await Promise.all([
      NotificationRepository.count(userId, filters),
      NotificationRepository.findMany(userId, filters),
    ]);

    const limit = filters.take || 20;
    const page = Math.floor((filters.skip || 0) / limit) + 1;
    const pages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages,
        hasNext: page < pages,
        hasPrevious: page > 1,
      },
    };
  }

  static async markAsRead(id, userId) {
    return await NotificationRepository.markRead(id, userId);
  }

  static async markAllAsRead(userId) {
    return await NotificationRepository.markAllRead(userId);
  }

  static async archive(id, userId) {
    return await NotificationRepository.archive(id, userId);
  }
}
