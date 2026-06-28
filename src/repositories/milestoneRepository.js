import prisma from "../config/db";

export class MilestoneRepository {
  static async create(data) { return prisma.milestone.create({ data }); }
  static async update(id, data) { return prisma.milestone.update({ where: { id }, data }); }
  static async findById(id) { return prisma.milestone.findFirst({ where: { id, isDeleted: false } }); }
  static async findByProjectId(projectId) {
    return prisma.milestone.findMany({
      where: { projectId, isDeleted: false },
      orderBy: { dueDate: "asc" },
    });
  }
  static async softDelete(id) { return prisma.milestone.update({ where: { id }, data: { isDeleted: true } }); }
}
