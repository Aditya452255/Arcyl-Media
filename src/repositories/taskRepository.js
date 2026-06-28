import prisma from "../config/db";

export class TaskRepository {
  static async create(data) {
    return prisma.task.create({
      data,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        milestone: { select: { id: true, title: true } },
      },
    });
  }

  static async update(id, data) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        milestone: { select: { id: true, title: true } },
      },
    });
  }

  static async findById(id) {
    return prisma.task.findFirst({
      where: { id, isDeleted: false },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        milestone: { select: { id: true, title: true } },
        comments: {
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        attachments: {
          include: { mediaAsset: true },
        },
      },
    });
  }

  static async findMany({
    skip = 0,
    take = 20,
    search = "",
    status,
    priority,
    assigneeId,
    projectId,
    milestoneId,
    dueDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  }) {
    const where = { isDeleted: false };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (projectId) where.projectId = projectId;
    if (milestoneId) where.milestoneId = milestoneId;
    
    if (dueDate) {
      const startOfDay = new Date(dueDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dueDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.dueDate = { gte: startOfDay, lte: endOfDay };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    return prisma.task.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        milestone: { select: { id: true, title: true } },
      },
    });
  }

  static async count({
    search = "",
    status,
    priority,
    assigneeId,
    projectId,
    milestoneId,
    dueDate,
  }) {
    const where = { isDeleted: false };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (projectId) where.projectId = projectId;
    if (milestoneId) where.milestoneId = milestoneId;

    if (dueDate) {
      const startOfDay = new Date(dueDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dueDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.dueDate = { gte: startOfDay, lte: endOfDay };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    return prisma.task.count({ where });
  }

  static async softDelete(id) {
    return prisma.task.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  // Get My Tasks categorized by timeframe
  static async findMyTasks(userId) {
    const now = new Date();
    
    // Today boundary
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Week boundary (end of current week, Sunday 23:59:59)
    const endOfWeek = new Date(now);
    const day = endOfWeek.getDay();
    const diff = endOfWeek.getDate() - day + (day === 0 ? 0 : 7); // end of Sunday
    endOfWeek.setDate(diff);
    endOfWeek.setHours(23, 59, 59, 999);

    // Recently completed boundary (last 7 days completed)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const baseSelect = {
      id: true,
      title: true,
      status: true,
      priority: true,
      dueDate: true,
      completedAt: true,
      project: { select: { id: true, name: true } },
      milestone: { select: { id: true, title: true } },
    };

    const [todayTasks, overdueTasks, weekTasks, recentCompletedTasks] = await Promise.all([
      // Due Today & Not Done
      prisma.task.findMany({
        where: {
          assigneeId: userId,
          isDeleted: false,
          status: { not: "DONE" },
          dueDate: { gte: startOfToday, lte: endOfToday },
        },
        select: baseSelect,
        orderBy: { priority: "desc" },
      }),
      // Overdue & Not Done
      prisma.task.findMany({
        where: {
          assigneeId: userId,
          isDeleted: false,
          status: { not: "DONE" },
          dueDate: { lt: startOfToday },
        },
        select: baseSelect,
        orderBy: { dueDate: "asc" },
      }),
      // Due This Week & Not Done (excluding today, which is in todayTasks)
      prisma.task.findMany({
        where: {
          assigneeId: userId,
          isDeleted: false,
          status: { not: "DONE" },
          dueDate: { gt: endOfToday, lte: endOfWeek },
        },
        select: baseSelect,
        orderBy: { dueDate: "asc" },
      }),
      // Completed in the last 7 days
      prisma.task.findMany({
        where: {
          assigneeId: userId,
          isDeleted: false,
          status: "DONE",
          completedAt: { gte: sevenDaysAgo },
        },
        select: baseSelect,
        orderBy: { completedAt: "desc" },
      }),
    ]);

    return {
      today: todayTasks,
      overdue: overdueTasks,
      thisWeek: weekTasks,
      recentlyCompleted: recentCompletedTasks,
    };
  }

  // Group tasks by status for Kanban Board
  static async findGroupedByStatus(projectId) {
    const statuses = ["TODO", "DOING", "REVIEW", "DONE"];
    
    const columns = await Promise.all(
      statuses.map(async (status) => {
        const tasks = await prisma.task.findMany({
          where: {
            projectId,
            status,
            isDeleted: false,
          },
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            milestone: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        return { status, tasks };
      })
    );

    return columns;
  }

  // Comments
  static async addComment(data) {
    return prisma.taskComment.create({
      data,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  static async findComments(taskId) {
    return prisma.taskComment.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  // Attachments
  static async addAttachment(data) {
    return prisma.taskAttachment.create({
      data,
      include: { mediaAsset: true },
    });
  }

  static async findAttachments(taskId) {
    return prisma.taskAttachment.findMany({
      where: { taskId },
      include: { mediaAsset: true },
    });
  }

  static async removeAttachment(id) {
    return prisma.taskAttachment.delete({
      where: { id },
    });
  }

  static async findAttachmentById(id) {
    return prisma.taskAttachment.findUnique({
      where: { id },
    });
  }
}
