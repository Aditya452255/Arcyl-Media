import { ClientPortalRepository } from "../repositories/clientPortalRepository";
import { MediaService } from "./mediaService";
import { AuditService } from "./auditService";
import { NotificationService } from "./notificationService";
import { NotFoundError, ValidationError } from "../utils/errors";
import prisma from "../config/db";
import bcrypt from "bcryptjs";

export class ClientPortalService {
  static async getDashboardSummary(clientId, userId) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client) throw new NotFoundError("Client not found");

    const stats = await ClientPortalRepository.getClientDashboardStats(clientId);
    const projects = await prisma.project.findMany({
      where: { clientId, isDeleted: false },
      select: { id: true, name: true, deadline: true },
    });
    const projectIds = projects.map((p) => p.id);

    // Upcoming deadlines: project deadlines in the future
    const upcomingDeadlines = projects
      .filter((p) => p.deadline && new Date(p.deadline) >= new Date())
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);

    // Recent files
    const recentFiles = await prisma.projectFile.findMany({
      where: { projectId: { in: projectIds }, isDeleted: false },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { mediaAsset: true },
    });

    // Unread messages count
    const unreadMessagesCount = await prisma.message.count({
      where: {
        projectId: { in: projectIds },
        senderId: { not: userId },
        isRead: false,
      },
    });

    // Pending deliverables list
    const pendingDeliverables = await prisma.deliverable.findMany({
      where: {
        projectId: { in: projectIds },
        status: "SUBMITTED",
        isDeleted: false,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Recent activity in these projects - fetch latest resource logs and filter in memory to avoid Json query issues
    const rawActivity = await prisma.activityLog.findMany({
      where: {
        resource: { in: ["Project", "Deliverable", "Task", "Message"] },
      },
      take: 30,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true } } },
    });

    const recentActivity = rawActivity
      .filter((log) => {
        if (log.resource === "Project" && log.resourceId) {
          return projectIds.includes(log.resourceId);
        }
        if (log.details && typeof log.details === "object") {
          const pId = log.details.projectId;
          if (pId) return projectIds.includes(pId);
        }
        return true;
      })
      .slice(0, 5);

    return {
      client: {
        id: client.id,
        companyName: client.companyName,
        logo: client.logo,
        industry: client.industry,
      },
      summary: stats,
      unreadMessagesCount,
      upcomingDeadlines,
      recentFiles,
      pendingDeliverables,
      recentActivity,
    };
  }

  static async getProjects(clientId, filters) {
    return ClientPortalRepository.findProjects(clientId, filters);
  }

  static async getProjectDetails(clientId, projectId) {
    const project = await ClientPortalRepository.findProjectById(clientId, projectId);
    if (!project) throw new NotFoundError("Project not found or access denied");
    return project;
  }

  // Deliverables
  static async getDeliverables(clientId, projectId) {
    await this._assertProjectAccess(clientId, projectId);
    return ClientPortalRepository.findDeliverables(projectId);
  }

  static async processDeliverableApproval(clientId, projectId, deliverableId, approved, feedback, userId) {
    await this._assertProjectAccess(clientId, projectId);
    const deliverable = await ClientPortalRepository.findDeliverableById(projectId, deliverableId);
    if (!deliverable) throw new NotFoundError("Deliverable not found");

    const status = approved ? "APPROVED" : "REJECTED";
    const updated = await ClientPortalRepository.updateDeliverableApproval(deliverableId, status, feedback);

    // Audit logs
    await AuditService.log(
      approved ? "DELIVERABLE_APPROVED" : "DELIVERABLE_REJECTED",
      { projectId, deliverableId, feedback },
      userId,
      deliverable,
      updated,
      "Deliverable"
    );

    // Notify project manager or project creator
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { managerId: true, name: true },
    });

    if (project && project.managerId) {
      await NotificationService.notifyUser(
        project.managerId,
        `Deliverable ${status}`,
        `Deliverable "${deliverable.title}" for project "${project.name}" was ${status.toLowerCase()} by client.`,
        approved ? "DELIVERABLE_APPROVED" : "DELIVERABLE_REJECTED"
      ).catch(() => {});
    }

    return updated;
  }

  // Files
  static async getFiles(clientId, projectId, filters) {
    await this._assertProjectAccess(clientId, projectId);
    return ClientPortalRepository.findFiles(projectId, filters);
  }

  static async uploadClientFile(clientId, projectId, file, userId) {
    await this._assertProjectAccess(clientId, projectId);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Limit files standard formats
    const ext = file.name.split(".").pop().toLowerCase();
    const allowed = ["jpg", "jpeg", "png", "gif", "pdf", "zip", "doc", "docx"];
    if (!allowed.includes(ext)) {
      throw new ValidationError("Unsupported file format for client portal shared documents.");
    }

    const mediaAsset = await MediaService.uploadFile(
      buffer,
      file.name,
      file.type,
      file.size,
      `arcyl_media/clients/${clientId}/projects/${projectId}`,
      userId,
      file.name
    );

    const projectFile = await ClientPortalRepository.addProjectFile({
      projectId,
      mediaAssetId: mediaAsset.id,
      fileCategory: "OTHER",
      uploadedById: userId,
    });

    await AuditService.log("CLIENT_FILE_UPLOAD", { projectId, fileId: projectFile.id }, userId, null, projectFile, "ProjectFile");

    // Notify Project Manager
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { managerId: true, name: true },
    });
    if (project && project.managerId) {
      await NotificationService.notifyUser(
        project.managerId,
        "Client Uploaded Shared File",
        `A new shared document "${file.name}" was uploaded to project "${project.name}".`,
        "FILE_UPLOADED"
      ).catch(() => {});
    }

    return projectFile;
  }

  // Messages Thread
  static async getMessages(clientId, projectId, userId) {
    await this._assertProjectAccess(clientId, projectId);
    // Mark messages read by other senders in this thread
    await ClientPortalRepository.markMessagesRead(projectId, userId);
    return ClientPortalRepository.findMessages(projectId);
  }

  static async sendMessage(clientId, projectId, content, attachments, userId) {
    await this._assertProjectAccess(clientId, projectId);

    const message = await ClientPortalRepository.createMessage({
      projectId,
      senderId: userId,
      content,
      attachments: attachments || null,
    });

    // Notify Project Manager
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { managerId: true, name: true },
    });
    if (project && project.managerId) {
      await NotificationService.notifyUser(
        project.managerId,
        "New Conversation Message",
        `New client message received in project "${project.name}".`,
        "MESSAGE_RECEIVED"
      ).catch(() => {});
    }

    return message;
  }

  // Update Profile
  static async updateProfile(userId, clientId, data) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    const userPayload = {};
    if (data.name) userPayload.name = data.name;
    if (data.password) {
      userPayload.passwordHash = await bcrypt.hash(data.password, 10);
    }

    // Update User credentials
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userPayload,
      select: { id: true, name: true, email: true },
    });

    // Update Client metadata properties
    const clientPayload = {};
    if (data.company) clientPayload.companyName = data.company;
    if (data.phone) clientPayload.address = data.phone; // Or standard mapped fields
    if (data.profilePicture) clientPayload.logo = data.profilePicture;

    if (Object.keys(clientPayload).length > 0) {
      await prisma.client.update({
        where: { id: clientId },
        data: clientPayload,
      });
    }

    await AuditService.log("CLIENT_PROFILE_UPDATE", { userId, clientId }, userId, user, updatedUser, "User");
    return updatedUser;
  }

  // Isolation Helper
  static async _assertProjectAccess(clientId, projectId) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, clientId, isDeleted: false },
    });
    if (!project) throw new NotFoundError("Project not found or client access denied");
  }
}
