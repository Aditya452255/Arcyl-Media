import prisma from "../config/db";

export class ProjectFileRepository {
  static async create(data) {
    return prisma.projectFile.create({
      data,
      include: { mediaAsset: true },
    });
  }
  static async findByProjectId(projectId) {
    return prisma.projectFile.findMany({
      where: { projectId, isDeleted: false },
      include: { mediaAsset: true, uploadedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
  static async findById(id) {
    return prisma.projectFile.findFirst({ where: { id, isDeleted: false }, include: { mediaAsset: true } });
  }
  static async softDelete(id) {
    return prisma.projectFile.update({ where: { id }, data: { isDeleted: true } });
  }
}
