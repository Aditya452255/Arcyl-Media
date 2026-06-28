import { MilestoneRepository } from "../repositories/milestoneRepository";
import { ProjectRepository } from "../repositories/projectRepository";
import { AuditService } from "./auditService";
import { NotFoundError } from "../utils/errors";

export class MilestoneService {
  static async createMilestone(projectId, data, userId) {
    await this._assertProjectExists(projectId);
    const milestone = await MilestoneRepository.create({ ...data, projectId });
    await AuditService.log("MILESTONE_CREATE", { milestoneId: milestone.id, projectId }, userId, null, milestone, "Milestone");
    return milestone;
  }

  static async updateMilestone(id, data, userId) {
    const existing = await MilestoneRepository.findById(id);
    if (!existing) throw new NotFoundError("Milestone not found");
    const milestone = await MilestoneRepository.update(id, data);
    await AuditService.log("MILESTONE_UPDATE", { milestoneId: id }, userId, existing, milestone, "Milestone");
    return milestone;
  }

  static async deleteMilestone(id, userId) {
    const existing = await MilestoneRepository.findById(id);
    if (!existing) throw new NotFoundError("Milestone not found");
    await MilestoneRepository.softDelete(id);
    await AuditService.log("MILESTONE_DELETE", { milestoneId: id }, userId, existing, null, "Milestone");
  }

  static async getMilestonesByProject(projectId) {
    await this._assertProjectExists(projectId);
    return MilestoneRepository.findByProjectId(projectId);
  }

  static async _assertProjectExists(projectId) {
    const p = await ProjectRepository.findById(projectId);
    if (!p) throw new NotFoundError("Project not found");
  }
}
