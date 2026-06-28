import prisma from "../config/db";

export class UserRepository {
  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  static async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  static async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
