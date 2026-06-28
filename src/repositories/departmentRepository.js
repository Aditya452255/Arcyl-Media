import prisma from "../config/db";

export class DepartmentRepository {
  static async create(data) {
    return prisma.department.create({
      data,
      include: { manager: true },
    });
  }

  static async update(id, data) {
    return prisma.department.update({
      where: { id },
      data,
      include: { manager: true },
    });
  }

  static async findById(id) {
    return prisma.department.findUnique({
      where: { id },
      include: { manager: true, employees: { where: { isDeleted: false } } },
    });
  }

  static async findByName(name) {
    return prisma.department.findUnique({
      where: { name },
    });
  }

  static async delete(id) {
    return prisma.department.delete({
      where: { id },
    });
  }

  static async findAll() {
    return prisma.department.findMany({
      include: { manager: true, _count: { select: { employees: { where: { isDeleted: false } } } } },
      orderBy: { name: "asc" },
    });
  }
}
