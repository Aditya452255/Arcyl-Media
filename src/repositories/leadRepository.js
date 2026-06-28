import prisma from "../config/db";

export class LeadRepository {
  static async findByEmail(email) {
    return prisma.lead.findUnique({
      where: { email },
    });
  }

  static async create(data) {
    return prisma.lead.create({
      data,
    });
  }

  static async update(id, data) {
    return prisma.lead.update({
      where: { id },
      data,
    });
  }
}
