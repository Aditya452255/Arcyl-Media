import { LeadService } from "../services/leadService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const leadUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
});

export class LeadController {
  /**
   * GET /api/admin/leads
   */
  static async getLeads(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const status = searchParams.get("status") || undefined;
    const isArchived = searchParams.get("isArchived") === "true";

    const result = await LeadService.getLeads({
      page,
      limit,
      search,
      sort,
      order,
      status,
      isArchived,
    });

    return ApiResponse.success("Leads list retrieved successfully", result.data, 200, result.pagination);
  }

  /**
   * GET /api/admin/leads/[id]
   */
  static async getLeadById(req, id) {
    const lead = await LeadService.getLeadById(id);
    return ApiResponse.success("Lead details retrieved successfully", lead, 200);
  }

  /**
   * PATCH /api/admin/leads/[id]
   */
  static async updateLead(req, id) {
    const body = await req.json();
    const parsed = leadUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const details = (parsed.error.issues || []).map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      throw new ValidationError("Validation failed", details);
    }

    const userId = req.user?.id;
    const lead = await LeadService.updateLead(id, parsed.data, userId);
    return ApiResponse.success("Lead updated successfully", lead, 200);
  }

  /**
   * POST /api/admin/leads/[id]/assign
   */
  static async assignLead(req, id) {
    const { assigneeId } = await req.json();
    const userId = req.user?.id;

    const lead = await LeadService.assignLead(id, assigneeId, userId);
    return ApiResponse.success("Lead assigned successfully", lead, 200);
  }

  /**
   * POST /api/admin/leads/[id]/status
   */
  static async changeStatus(req, id) {
    const { status } = await req.json();
    const userId = req.user?.id;

    const lead = await LeadService.changeStatus(id, status, userId);
    return ApiResponse.success("Lead status transitioned successfully", lead, 200);
  }

  /**
   * POST /api/admin/leads/[id]/notes
   */
  static async addNote(req, id) {
    const { content } = await req.json();
    const userId = req.user?.id;

    const note = await LeadService.addNote(id, content, userId);
    return ApiResponse.success("CRM note added successfully", note, 201);
  }

  /**
   * POST /api/admin/leads/[id]/archive
   */
  static async archiveLead(req, id) {
    const { isArchived } = await req.json();
    const userId = req.user?.id;

    const lead = await LeadService.archiveLead(id, isArchived, userId);
    const msg = isArchived ? "Lead archived successfully" : "Lead restored successfully";
    return ApiResponse.success(msg, lead, 200);
  }

  /**
   * DELETE /api/admin/leads/[id]
   */
  static async deleteLead(req, id) {
    const userId = req.user?.id;
    await LeadService.deleteLead(id, userId);
    return ApiResponse.success("Lead deleted successfully from core record", null, 200);
  }
}
