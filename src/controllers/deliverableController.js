import { DeliverableService } from "../services/deliverableService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  version: z.string().default("1.0"),
  status: z.enum(["DRAFT", "SUBMITTED", "REVISION_REQUESTED", "APPROVED", "REJECTED"]).default("DRAFT"),
  dueDate: z.string().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  fileUrl: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
});

export class DeliverableController {
  static async list(req, projectId) {
    return ApiResponse.success("Deliverables retrieved", await DeliverableService.getDeliverablesByProject(projectId), 200);
  }
  static async create(req, projectId) {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Deliverable created", await DeliverableService.createDeliverable(projectId, parsed.data, req.user?.id), 201);
  }
  static async update(req, projectId, deliverableId) {
    const body = await req.json();
    const parsed = schema.partial().safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Deliverable updated", await DeliverableService.updateDeliverable(deliverableId, parsed.data, req.user?.id), 200);
  }
  static async delete(req, projectId, deliverableId) {
    await DeliverableService.deleteDeliverable(deliverableId, req.user?.id);
    return ApiResponse.success("Deliverable deleted", null, 200);
  }
  static async approve(req, projectId, deliverableId) {
    const body = await req.json().catch(() => ({}));
    return ApiResponse.success("Deliverable approval processed",
      await DeliverableService.approveDeliverable(deliverableId, body.approved !== false, body.feedback, req.user?.id), 200
    );
  }
}
