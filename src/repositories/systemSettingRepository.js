import prisma from "../config/db";

export class SystemSettingRepository {
  static async create(data) {
    return prisma.systemSetting.create({ data });
  }

  static async update(key, data) {
    return prisma.systemSetting.update({
      where: { key },
      data,
    });
  }

  static async findByKey(key) {
    return prisma.systemSetting.findUnique({
      where: { key },
    });
  }

  static async delete(key) {
    return prisma.systemSetting.delete({
      where: { key },
    });
  }

  static async findByCategory(category) {
    return prisma.systemSetting.findMany({
      where: { category },
      orderBy: { key: "asc" },
    });
  }

  static async findAll() {
    return prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });
  }
}
