import prisma from "../config/db";

export class EmployeeRepository {
  static async create(data) {
    return prisma.employee.create({
      data,
      include: { department: true },
    });
  }

  static async update(id, data) {
    return prisma.employee.update({
      where: { id },
      data,
      include: { department: true },
    });
  }

  static async findById(id) {
    return prisma.employee.findFirst({
      where: { id, isDeleted: false },
      include: { department: true },
    });
  }

  static async findByEmail(email) {
    return prisma.employee.findFirst({
      where: { email, isDeleted: false },
    });
  }

  static async softDelete(id) {
    return prisma.employee.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  static async findMany({
    skip = 0,
    take = 20,
    search = "",
    departmentId,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  }) {
    const where = { isDeleted: false };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.employmentStatus = status;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { designation: { contains: search, mode: "insensitive" } },
      ];
    }

    return prisma.employee.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: { department: true },
    });
  }

  static async count({ search = "", departmentId, status }) {
    const where = { isDeleted: false };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.employmentStatus = status;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { designation: { contains: search, mode: "insensitive" } },
      ];
    }

    return prisma.employee.count({ where });
  }
}
