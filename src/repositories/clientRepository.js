import prisma from "../config/db";

export class ClientRepository {
  static async create(data) {
    return prisma.client.create({ data });
  }

  static async update(id, data) {
    return prisma.client.update({ where: { id }, data });
  }

  static async findById(id) {
    return prisma.client.findFirst({
      where: { id, isDeleted: false },
      include: { _count: { select: { contacts: true, projects: true } } },
    });
  }

  static async findMany({ skip = 0, take = 20, search = "", status, sortBy = "createdAt", sortOrder = "desc" }) {
    const where = { isDeleted: false };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
        { website: { contains: search, mode: "insensitive" } },
      ];
    }
    return prisma.client.findMany({
      where, skip, take,
      orderBy: { [sortBy]: sortOrder },
      include: { _count: { select: { contacts: true, projects: true } } },
    });
  }

  static async count({ search = "", status }) {
    const where = { isDeleted: false };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
      ];
    }
    return prisma.client.count({ where });
  }

  static async softDelete(id) {
    return prisma.client.update({ where: { id }, data: { isDeleted: true } });
  }

  static async archive(id, isArchived) {
    return prisma.client.update({ where: { id }, data: { isArchived, status: isArchived ? "ARCHIVED" : "ACTIVE" } });
  }
}
