import { ProjectRepository } from "../repositories/projectRepository";
import { AuditService } from "./auditService";
import { NotificationService } from "./notificationService";
import { NotFoundError } from "../utils/errors";

export class ProjectService {
  static async createProject(data, userId) {
    const cleanData = { ...data };
    delete cleanData.progress;
    const project = await ProjectRepository.create(cleanData);
    await AuditService.log("PROJECT_CREATE", { projectId: project.id, name: project.name }, userId, null, project, "Project");
    try {
      await NotificationService.notifyAll("New Project Created", `Project "${project.name}" has been created.`, "CMS_UPDATED");
    } catch (_) {}
    return project;
  }

  static async updateProject(id, data, userId) {
    const existing = await ProjectRepository.findById(id);
    if (!existing) throw new NotFoundError("Project not found");
    const cleanData = { ...data };
    delete cleanData.progress;
    const project = await ProjectRepository.update(id, cleanData);
    await AuditService.log("PROJECT_UPDATE", { projectId: id }, userId, existing, project, "Project");
    return project;
  }

  static async getProjectById(id) {
    const project = await ProjectRepository.findById(id);
    if (!project) throw new NotFoundError("Project not found");
    return project;
  }

  static async softDeleteProject(id, userId) {
    const existing = await ProjectRepository.findById(id);
    if (!existing) throw new NotFoundError("Project not found");
    await ProjectRepository.softDelete(id);
    await AuditService.log("PROJECT_DELETE", { projectId: id }, userId, existing, null, "Project");
  }

  static async getProjectsList(filters) {
    const [total, data] = await Promise.all([
      ProjectRepository.count(filters),
      ProjectRepository.findMany(filters),
    ]);
    const limit = filters.take || 20;
    const page = Math.floor((filters.skip || 0) / limit) + 1;
    const pages = Math.ceil(total / limit);
    return { data, pagination: { total, page, limit, pages, hasNext: page < pages, hasPrevious: page > 1 } };
  }

  static async getKanbanView() {
    return ProjectRepository.findGroupedByStatus();
  }

  static async getDashboard() {
    return ProjectRepository.getDashboardStats();
  }
}
