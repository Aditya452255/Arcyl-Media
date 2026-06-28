import prisma from "../config/db";

export class OrganizationRepository {
  static async get() {
    return prisma.organizationSetting.findFirst();
  }

  static async create(data) {
    return prisma.organizationSetting.create({ data });
  }

  static async update(id, data) {
    return prisma.organizationSetting.update({
      where: { id },
      data,
    });
  }
}
