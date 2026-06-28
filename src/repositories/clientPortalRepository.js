import prisma from "../config/db";

export class ClientPortalRepository {
  // Projects
  static async findProjects(clientId, { search = "" }) {
    const where = {
      clientId,
      isDeleted: false,
    };
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    return prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        _count: { select: { milestones: true, tasks: true, deliverables: true } },
      },
    });
  }

  static async findProjectById(clientId, id) {
    return prisma.project.findFirst({
      where: { id, clientId, isDeleted: false },
      include: {
        manager: { select: { id: true, name: true, email: true } },
        milestones: {
          where: { isDeleted: false },
          orderBy: { dueDate: "asc" },
        },
        tasks: {
          where: { isDeleted: false },
          orderBy: { dueDate: "asc" },
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
            assignee: { select: { name: true } },
          },
        },
      },
    });
  }

  // Deliverables
  static async findDeliverables(projectId) {
    return prisma.deliverable.findMany({
      where: { projectId, isDeleted: false },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findDeliverableById(projectId, id) {
    return prisma.deliverable.findFirst({
      where: { id, projectId, isDeleted: false },
    });
  }

  static async updateDeliverableApproval(id, status, feedback) {
    return prisma.deliverable.update({
      where: { id },
      data: {
        approvalStatus: status,
        status, // keep in sync
        feedback,
      },
    });
  }

  // Project Files
  static async findFiles(projectId, { search = "" }) {
    const where = {
      projectId,
      isDeleted: false,
    };
    if (search) {
      where.mediaAsset = {
        altText: { contains: search, mode: "insensitive" },
      };
    }
    return prisma.projectFile.findMany({
      where,
      include: { mediaAsset: true },
      orderBy: { createdAt: "desc" },
    });
  }

  static async addProjectFile(data) {
    return prisma.projectFile.create({
      data,
      include: { mediaAsset: true },
    });
  }

  // Messages Thread
  static async findMessages(projectId) {
    return prisma.message.findMany({
      where: { projectId },
      include: { sender: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  static async createMessage(data) {
    return prisma.message.create({
      data,
      include: { sender: { select: { id: true, name: true, email: true } } },
    });
  }

  static async markMessagesRead(projectId, userId) {
    return prisma.message.updateMany({
      where: {
        projectId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  // General dashboard stats
  static async getClientDashboardStats(clientId) {
    const projects = await prisma.project.findMany({
      where: { clientId, isDeleted: false },
      select: { id: true, status: true, progress: true },
    });

    const activeCount = projects.filter((p) => p.status === "ACTIVE").length;
    const completedCount = projects.filter((p) => p.status === "COMPLETED").length;

    // Fetch pending deliverables across these projects
    const projectIds = projects.map((p) => p.id);
    
    const [pendingDeliverablesCount, sharedFilesCount] = await Promise.all([
      prisma.deliverable.count({
        where: { projectId: { in: projectIds }, status: "SUBMITTED", isDeleted: false },
      }),
      prisma.projectFile.count({
        where: { projectId: { in: projectIds }, isDeleted: false },
      }),
    ]);

    return {
      activeProjects: activeCount,
      completedProjects: completedCount,
      pendingDeliverablesCount,
      sharedFilesCount,
    };
  }
}
