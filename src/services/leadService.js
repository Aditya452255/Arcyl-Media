import { LeadRepository } from "../repositories/leadRepository";
import { UserRepository } from "../repositories/userRepository";
import { AuditService } from "./auditService";
import { NotFoundError, ValidationError } from "../utils/errors";
import { LEAD_STATUS } from "../constants/status";

export class LeadService {
  /**
   * Fetch paginated and filtered leads list
   */
  static async getLeads(params) {
    return LeadRepository.findManyPaginated(params);
  }

  /**
   * Fetch details of a single lead
   */
  static async getLeadById(id) {
    const lead = await LeadRepository.findById(id);
    if (!lead) {
      throw new NotFoundError("Lead not found");
    }
    return lead;
  }

  /**
   * Update lead metadata
   */
  static async updateLead(id, data, userId) {
    const existing = await LeadRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Lead not found");
    }

    const updated = await LeadRepository.update(id, data);
    await AuditService.log(
      "LEAD_UPDATE",
      {
        leadId: id,
        oldValue: existing,
        newValue: updated,
      },
      userId
    );
    return updated;
  }

  /**
   * Assign lead to an internal User (agent/sales rep)
   */
  static async assignLead(id, assigneeId, userId) {
    const lead = await LeadRepository.findById(id);
    if (!lead) {
      throw new NotFoundError("Lead not found");
    }

    if (assigneeId) {
      const user = await UserRepository.findById(assigneeId);
      if (!user) {
        throw new NotFoundError("Assignee user not found");
      }
    }

    const updated = await LeadRepository.update(id, { assigneeId });
    await AuditService.log(
      "LEAD_ASSIGN",
      {
        leadId: id,
        assigneeId,
        oldAssigneeId: lead.assigneeId,
      },
      userId
    );
    return updated;
  }

  /**
   * Transition Lead pipeline status
   */
  static async changeStatus(id, status, userId) {
    const lead = await LeadRepository.findById(id);
    if (!lead) {
      throw new NotFoundError("Lead not found");
    }

    if (!Object.values(LEAD_STATUS).includes(status)) {
      throw new ValidationError(`Invalid lead status '${status}'`);
    }

    const updated = await LeadRepository.update(id, { status });
    await AuditService.log(
      "LEAD_STATUS_CHANGE",
      {
        leadId: id,
        oldStatus: lead.status,
        newStatus: status,
      },
      userId
    );
    return updated;
  }

  /**
   * Append CRM note to lead conversation timeline
   */
  static async addNote(id, content, userId) {
    if (!content || content.trim() === "") {
      throw new ValidationError("Note content cannot be empty");
    }

    const lead = await LeadRepository.findById(id);
    if (!lead) {
      throw new NotFoundError("Lead not found");
    }

    const note = await LeadRepository.addNote(id, userId, content);
    await AuditService.log(
      "LEAD_ADD_NOTE",
      {
        leadId: id,
        noteId: note.id,
      },
      userId
    );
    return note;
  }

  /**
   * Archive / Restore Lead record
   */
  static async archiveLead(id, isArchived, userId) {
    const lead = await LeadRepository.findById(id);
    if (!lead) {
      throw new NotFoundError("Lead not found");
    }

    const updated = await LeadRepository.update(id, { isArchived });
    await AuditService.log(
      isArchived ? "LEAD_ARCHIVE" : "LEAD_RESTORE",
      { leadId: id },
      userId
    );
    return updated;
  }

  /**
   * Hard delete Lead
   */
  static async deleteLead(id, userId) {
    const lead = await LeadRepository.findById(id);
    if (!lead) {
      throw new NotFoundError("Lead not found");
    }

    await LeadRepository.delete(id);
    await AuditService.log("LEAD_DELETE", { leadId: id, details: lead }, userId);
    return true;
  }
}
