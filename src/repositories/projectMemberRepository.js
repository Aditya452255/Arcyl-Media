import prisma from "../config/db";

export class ProjectMemberRepository {
  static async add(data) {
    return prisma.projectMember.create({
      data,
      include: { employee: { select: { id: true, firstName: true, lastName: true, designation: true, profilePhoto: true } } },
    });
  }
  static async update(id, data) {
    return prisma.projectMember.update({
      where: { id },
      data,
      include: { employee: { select: { id: true, firstName: true, lastName: true, designation: true, profilePhoto: true } } },
    });
  }
  static async findById(id) { return prisma.projectMember.findUnique({ where: { id } }); }
  static async findByProjectId(projectId) {
    return prisma.projectMember.findMany({
      where: { projectId },
      include: { employee: { select: { id: true, firstName: true, lastName: true, designation: true, profilePhoto: true, department: { select: { name: true } } } } },
      orderBy: { assignedAt: "asc" },
    });
  }
  static async remove(id) { return prisma.projectMember.delete({ where: { id } }); }
  static async findExisting(projectId, employeeId) {
    return prisma.projectMember.findUnique({ where: { projectId_employeeId: { projectId, employeeId } } });
  }
}
