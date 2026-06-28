import prisma from "../config/db";

const projectInclude = {
  client: { select: { id: true, companyName: true, logo: true } },
  manager: { select: { id: true, name: true, email: true } },
  _count: { select: { members: true, milestones: true, deliverables: true, timeEntries: true } },
};

export class ProjectRepository {
  static async create(data) {
    return prisma.project.create({ data, include: projectInclude });
  }

  static async update(id, data) {
    return prisma.project.update({ where: { id }, data, include: projectInclude });
  }

  static async findById(id) {
    return prisma.project.findFirst({
      where: { id, isDeleted: false },
      include: {
        ...projectInclude,
        milestones: { where: { isDeleted: false }, orderBy: { dueDate: "asc" } },
        members: {
          where: {},
          include: { employee: { select: { id: true, firstName: true, lastName: true, profilePhoto: true, designation: true } } },
        },
      },
    });
  }

  static async findMany({ skip = 0, take = 20, search = "", status, priority, clientId, managerId, sortBy = "createdAt", sortOrder = "desc" }) {
    const where = { isDeleted: false };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (clientId) where.clientId = clientId;
    if (managerId) where.managerId = managerId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    return prisma.project.findMany({ where, skip, take, orderBy: { [sortBy]: sortOrder }, include: projectInclude });
  }

  static async count({ search = "", status, priority, clientId, managerId }) {
    const where = { isDeleted: false };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (clientId) where.clientId = clientId;
    if (managerId) where.managerId = managerId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    return prisma.project.count({ where });
  }

  static async softDelete(id) {
    return prisma.project.update({ where: { id }, data: { isDeleted: true } });
  }

  // For kanban — group by status
  static async findGroupedByStatus() {
    const statuses = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"];
    const groups = await Promise.all(
      statuses.map(async (status) => ({
        status,
        projects: await prisma.project.findMany({
          where: { status, isDeleted: false },
          orderBy: { updatedAt: "desc" },
          include: projectInclude,
        }),
      }))
    );
    return groups;
  }

  // For dashboard aggregates
  static async getDashboardStats() {
    const [active, onHold, completed, delayed, upcoming] = await Promise.all([
      prisma.project.count({ where: { status: "ACTIVE", isDeleted: false } }),
      prisma.project.count({ where: { status: "ON_HOLD", isDeleted: false } }),
      prisma.project.count({ where: { status: "COMPLETED", isDeleted: false } }),
      prisma.project.count({
        where: { status: "ACTIVE", isDeleted: false, deadline: { lt: new Date() } },
      }),
      prisma.project.findMany({
        where: { status: "ACTIVE", isDeleted: false, deadline: { gte: new Date() } },
        orderBy: { deadline: "asc" },
        take: 5,
        include: projectInclude,
      }),
    ]);
    return { active, onHold, completed, delayed, upcoming };
  }
}
