import prisma from "../config/db";

export class ClientContactRepository {
  static async create(data) {
    return prisma.clientContact.create({ data });
  }

  static async update(id, data) {
    return prisma.clientContact.update({ where: { id }, data });
  }

  static async findById(id) {
    return prisma.clientContact.findFirst({ where: { id, isDeleted: false } });
  }

  static async findByClientId(clientId) {
    return prisma.clientContact.findMany({
      where: { clientId, isDeleted: false },
      orderBy: { firstName: "asc" },
    });
  }

  static async softDelete(id) {
    return prisma.clientContact.update({ where: { id }, data: { isDeleted: true } });
  }
}
