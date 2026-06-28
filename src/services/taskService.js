import { TaskRepository } from "../repositories/taskRepository";
import { AuditService } from "./auditService";
import { NotificationService } from "./notificationService";
import { MediaService } from "./mediaService";
import { NotFoundError, ValidationError } from "../utils/errors";
import prisma from "../config/db";

export class TaskService {
  static async createTask(data, userId) {
    const task = await TaskRepository.create({
      ...data,
      createdById: userId,
    });

    // Recalculate progress for project/milestone
    await this.recalculateProgress(task.projectId, task.milestoneId);

    // Audit Log
    await AuditService.log("TASK_CREATE", { taskId: task.id, title: task.title }, userId, null, task, "Task");

    // Notifications
    if (task.assigneeId) {
      await NotificationService.notifyUser(
        task.assigneeId,
        "New Task Assigned",
        `You have been assigned to task: "${task.title}"`,
        "TASK_ASSIGNED"
      ).catch(() => {});
    }

    return task;
  }

  static async updateTask(id, data, userId) {
    const existing = await TaskRepository.findById(id);
    if (!existing) throw new NotFoundError("Task not found");

    const payload = { ...data };
    
    // Manage completedAt field automatically
    if (payload.status === "DONE" && existing.status !== "DONE") {
      payload.completedAt = new Date();
    } else if (payload.status && payload.status !== "DONE" && existing.status === "DONE") {
      payload.completedAt = null;
    }

    payload.updatedById = userId;

    const task = await TaskRepository.update(id, payload);

    // Recalculate progress if project, milestone or status changed
    const projectChanged = existing.projectId !== task.projectId;
    const milestoneChanged = existing.milestoneId !== task.milestoneId;
    const statusChanged = existing.status !== task.status;

    if (projectChanged || milestoneChanged || statusChanged) {
      if (projectChanged) {
        await this.recalculateProgress(existing.projectId, existing.milestoneId);
      }
      await this.recalculateProgress(task.projectId, task.milestoneId);
    }

    // Audit logs & notifications based on status / assignee shifts
    await AuditService.log("TASK_UPDATE", { taskId: id }, userId, existing, task, "Task");

    if (task.assigneeId && existing.assigneeId !== task.assigneeId) {
      await NotificationService.notifyUser(
        task.assigneeId,
        "Task Assigned",
        `You have been assigned to task: "${task.title}"`,
        "TASK_ASSIGNED"
      ).catch(() => {});
    }

    if (statusChanged) {
      if (task.status === "DONE") {
        await AuditService.log("TASK_COMPLETE", { taskId: id, title: task.title }, userId, null, null, "Task");
        if (task.createdById) {
          await NotificationService.notifyUser(
            task.createdById,
            "Task Completed",
            `Task "${task.title}" has been completed.`,
            "TASK_COMPLETED"
          ).catch(() => {});
        }
      } else if (task.status === "REVIEW") {
        if (task.createdById) {
          await NotificationService.notifyUser(
            task.createdById,
            "Task Ready for Review",
            `Task "${task.title}" is ready for review.`,
            "TASK_REVIEW"
          ).catch(() => {});
        }
      }
    }

    return task;
  }

  static async deleteTask(id, userId) {
    const existing = await TaskRepository.findById(id);
    if (!existing) throw new NotFoundError("Task not found");

    await TaskRepository.softDelete(id);
    await this.recalculateProgress(existing.projectId, existing.milestoneId);

    await AuditService.log("TASK_DELETE", { taskId: id, title: existing.title }, userId, existing, null, "Task");
  }

  static async getTaskById(id) {
    const task = await TaskRepository.findById(id);
    if (!task) throw new NotFoundError("Task not found");
    return task;
  }

  static async getTasksList(filters) {
    const [total, data] = await Promise.all([
      TaskRepository.count(filters),
      TaskRepository.findMany(filters),
    ]);
    const limit = filters.take || 20;
    const page = Math.floor((filters.skip || 0) / limit) + 1;
    const pages = Math.ceil(total / limit);
    return { data, pagination: { total, page, limit, pages, hasNext: page < pages, hasPrevious: page > 1 } };
  }

  static async getMyTasks(userId) {
    return TaskRepository.findMyTasks(userId);
  }

  static async getKanbanBoard(projectId) {
    if (!projectId) throw new ValidationError("projectId is required for Kanban view");
    return TaskRepository.findGroupedByStatus(projectId);
  }

  // Comments
  static async addComment(taskId, message, userId) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");

    const comment = await TaskRepository.addComment({
      taskId,
      userId,
      message,
    });

    await AuditService.log("TASK_COMMENT_ADD", { taskId, commentId: comment.id }, userId, null, comment, "TaskComment");
    return comment;
  }

  static async getComments(taskId) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");
    return TaskRepository.findComments(taskId);
  }

  // Attachments
  static async addAttachment(taskId, file, userId) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");

    // Reuse media library service to upload file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Limit standard extensions
    const ext = file.name.split(".").pop().toLowerCase();
    const allowed = ["jpg", "jpeg", "png", "gif", "pdf", "zip", "doc", "docx"];
    if (!allowed.includes(ext)) {
      throw new ValidationError("Only Images, PDFs, ZIPs, and Word Docs are allowed as attachments.");
    }

    const mediaAsset = await MediaService.uploadFile(
      buffer,
      file.name,
      file.type,
      file.size,
      `arcyl_media/tasks/${taskId}`,
      userId,
      file.name
    );

    const attachment = await TaskRepository.addAttachment({
      taskId,
      mediaAssetId: mediaAsset.id,
    });

    await AuditService.log("TASK_ATTACHMENT_ADD", { taskId, attachmentId: attachment.id }, userId, null, attachment, "TaskAttachment");
    return attachment;
  }

  static async getAttachments(taskId) {
    const task = await TaskRepository.findById(taskId);
    if (!task) throw new NotFoundError("Task not found");
    return TaskRepository.findAttachments(taskId);
  }

  static async removeAttachment(attachmentId, userId) {
    const attachment = await TaskRepository.findAttachmentById(attachmentId);
    if (!attachment) throw new NotFoundError("Attachment not found");

    await TaskRepository.removeAttachment(attachmentId);
    await AuditService.log("TASK_ATTACHMENT_DELETE", { taskId: attachment.taskId, attachmentId }, userId, attachment, null, "TaskAttachment");
  }

  // Progress Calculation Helper
  static async recalculateProgress(projectId, milestoneId) {
    if (projectId) {
      const totalTasks = await prisma.task.count({
        where: { projectId, isDeleted: false },
      });
      const completedTasks = await prisma.task.count({
        where: { projectId, status: "DONE", isDeleted: false },
      });
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      await prisma.project.update({
        where: { id: projectId },
        data: { progress },
      });
    }

    if (milestoneId) {
      const totalMilestoneTasks = await prisma.task.count({
        where: { milestoneId, isDeleted: false },
      });
      const completedMilestoneTasks = await prisma.task.count({
        where: { milestoneId, status: "DONE", isDeleted: false },
      });
      const milestoneProgress = totalMilestoneTasks > 0 ? Math.round((completedMilestoneTasks / totalMilestoneTasks) * 100) : 0;
      await prisma.milestone.update({
        where: { id: milestoneId },
        data: { progress: milestoneProgress },
      });
    }
  }

  // Task Widgets Dashboard Metrics
  static async getTaskDashboardStats(userId) {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [myTasksCount, dueTodayCount, overdueCount, completedThisWeekCount, recentTaskActivity] = await Promise.all([
      // My Total Tasks (not done)
      prisma.task.count({
        where: { assigneeId: userId, isDeleted: false, status: { not: "DONE" } },
      }),
      // Tasks Due Today (any user, not done)
      prisma.task.count({
        where: { isDeleted: false, status: { not: "DONE" }, dueDate: { gte: startOfToday, lte: endOfToday } },
      }),
      // Overdue Tasks (any user, not done)
      prisma.task.count({
        where: { isDeleted: false, status: { not: "DONE" }, dueDate: { lt: startOfToday } },
      }),
      // Completed This Week (any user)
      prisma.task.count({
        where: { isDeleted: false, status: "DONE", completedAt: { gte: startOfWeek } },
      }),
      // Recent Task Activities
      prisma.activityLog.findMany({
        where: { resource: "Task" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } },
      }),
    ]);

    return {
      myTasksCount,
      dueTodayCount,
      overdueCount,
      completedThisWeekCount,
      recentTaskActivity,
    };
  }

  // Cron/Scheduler function for Overdue Alerts (Manual Trigger or Route-driven)
  static async checkOverdueTasksAndNotify() {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const overdueTasks = await prisma.task.findMany({
      where: {
        isDeleted: false,
        status: { not: "DONE" },
        dueDate: { lt: startOfToday },
        assigneeId: { not: null },
      },
      include: { assignee: { select: { id: true, name: true } } },
    });

    for (const task of overdueTasks) {
      await NotificationService.notifyUser(
        task.assigneeId,
        "Task Overdue Alert",
        `The task "${task.title}" is overdue. Please review.`,
        "TASK_OVERDUE"
      ).catch(() => {});
    }

    return overdueTasks.length;
  }
}
