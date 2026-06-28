import prisma from "../config/db";

export class ActivityLogRepository {
  static async create(data) {
    return prisma.activityLog.create({
      data,
    });
  }
}
