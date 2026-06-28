import prisma from "../config/db";

export class DeliverableRepository {
  static async create(data) { return prisma.deliverable.create({ data }); }
  static async update(id, data) { return prisma.deliverable.update({ where: { id }, data }); }
  static async findById(id) { return prisma.deliverable.findFirst({ where: { id, isDeleted: false } }); }
  static async findByProjectId(projectId) {
    return prisma.deliverable.findMany({
      where: { projectId, isDeleted: false },
      orderBy: { dueDate: "asc" },
    });
  }
  static async softDelete(id) { return prisma.deliverable.update({ where: { id }, data: { isDeleted: true } }); }
}
