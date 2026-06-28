import prisma from "../config/db";

export class PermissionRepository {
  /**
   * Retrieves all resource permission strings mapped to a User's roles
   */
  static async findUserPermissions(userId) {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const permissions = new Set();
    userRoles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        if (rp.permission?.name) {
          permissions.add(rp.permission.name);
        }
      });
    });

    return Array.from(permissions);
  }
}
