import { DeliverableRepository } from "../repositories/deliverableRepository";
import { ProjectRepository } from "../repositories/projectRepository";
import { AuditService } from "./auditService";
import { NotFoundError } from "../utils/errors";

export class DeliverableService {
  static async createDeliverable(projectId, data, userId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    const deliverable = await DeliverableRepository.create({ ...data, projectId });
    await AuditService.log("DELIVERABLE_CREATE", { projectId, deliverableId: deliverable.id }, userId, null, deliverable, "Deliverable");
    return deliverable;
  }

  static async updateDeliverable(id, data, userId) {
    const existing = await DeliverableRepository.findById(id);
    if (!existing) throw new NotFoundError("Deliverable not found");
    const deliverable = await DeliverableRepository.update(id, data);
    await AuditService.log("DELIVERABLE_UPDATE", { deliverableId: id }, userId, existing, deliverable, "Deliverable");
    return deliverable;
  }

  static async approveDeliverable(id, approved, feedback, userId) {
    const existing = await DeliverableRepository.findById(id);
    if (!existing) throw new NotFoundError("Deliverable not found");
    const deliverable = await DeliverableRepository.update(id, {
      approvalStatus: approved ? "APPROVED" : "REJECTED",
      status: approved ? "APPROVED" : "REVISION_REQUESTED",
      feedback: feedback || null,
    });
    await AuditService.log(approved ? "DELIVERABLE_APPROVED" : "DELIVERABLE_REJECTED", { deliverableId: id, feedback }, userId, existing, deliverable, "Deliverable");
    return deliverable;
  }

  static async deleteDeliverable(id, userId) {
    const existing = await DeliverableRepository.findById(id);
    if (!existing) throw new NotFoundError("Deliverable not found");
    await DeliverableRepository.softDelete(id);
    await AuditService.log("DELIVERABLE_DELETE", { deliverableId: id }, userId, existing, null, "Deliverable");
  }

  static async getDeliverablesByProject(projectId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    return DeliverableRepository.findByProjectId(projectId);
  }
}
