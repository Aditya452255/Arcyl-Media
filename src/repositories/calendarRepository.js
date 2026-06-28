import prisma from "../config/db";

export class CalendarRepository {
  static async create(data) {
    return prisma.calendarEvent.create({
      data,
      include: { createdBy: { select: { id: true, name: true } } },
    });
  }

  static async update(id, data) {
    return prisma.calendarEvent.update({
      where: { id },
      data,
      include: { createdBy: { select: { id: true, name: true } } },
    });
  }

  static async findById(id) {
    return prisma.calendarEvent.findFirst({ where: { id, isDeleted: false }, include: { createdBy: { select: { id: true, name: true } } } });
  }

  static async findMany({ startAt, endAt, type, projectId }) {
    const where = { isDeleted: false };
    if (type) where.type = type;
    if (projectId) where.projectId = projectId;
    if (startAt || endAt) {
      where.startAt = {};
      if (startAt) where.startAt.gte = new Date(startAt);
      if (endAt) where.startAt.lte = new Date(endAt);
    }
    return prisma.calendarEvent.findMany({
      where,
      orderBy: { startAt: "asc" },
      include: { createdBy: { select: { id: true, name: true } } },
    });
  }

  static async softDelete(id) {
    return prisma.calendarEvent.update({ where: { id }, data: { isDeleted: true } });
  }
}
