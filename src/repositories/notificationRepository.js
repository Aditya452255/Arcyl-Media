import prisma from "../config/db";

export class NotificationRepository {
  static async create(data) {
    return prisma.notification.create({ data });
  }

  static async findById(id) {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  static async findMany(userId, { skip = 0, take = 20, isRead, isArchived = false }) {
    const where = { userId, isArchived };

    if (typeof isRead === "boolean") {
      where.isRead = isRead;
    }

    return prisma.notification.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  static async count(userId, { isRead, isArchived = false }) {
    const where = { userId, isArchived };

    if (typeof isRead === "boolean") {
      where.isRead = isRead;
    }

    return prisma.notification.count({ where });
  }

  static async markRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  static async markAllRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  static async archive(id, userId) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isArchived: true },
    });
  }
}
