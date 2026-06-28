import prisma from "../config/db";

export class TimeEntryRepository {
  static async create(data) {
    return prisma.timeEntry.create({
      data,
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  static async findByProjectId(projectId) {
    return prisma.timeEntry.findMany({
      where: { projectId, isDeleted: false },
      include: { employee: { select: { id: true, firstName: true, lastName: true, designation: true } } },
      orderBy: { startTime: "desc" },
    });
  }

  static async findById(id) {
    return prisma.timeEntry.findFirst({ where: { id, isDeleted: false } });
  }

  static async softDelete(id) {
    return prisma.timeEntry.update({ where: { id }, data: { isDeleted: true } });
  }

  // Sum of all durations in minutes grouped by employee
  static async getSummaryByProject(projectId) {
    return prisma.timeEntry.groupBy({
      by: ["employeeId"],
      where: { projectId, isDeleted: false },
      _sum: { duration: true },
    });
  }
}
