import { MilestoneService } from "../services/milestoneService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED"]).default("PENDING"),
  progress: z.number().int().min(0).max(100).default(0),
});

export class MilestoneController {
  static async list(req, projectId) {
    return ApiResponse.success("Milestones retrieved", await MilestoneService.getMilestonesByProject(projectId), 200);
  }
  static async create(req, projectId) {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Milestone created", await MilestoneService.createMilestone(projectId, parsed.data, req.user?.id), 201);
  }
  static async update(req, projectId, milestoneId) {
    const body = await req.json();
    const parsed = schema.partial().safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Milestone updated", await MilestoneService.updateMilestone(milestoneId, parsed.data, req.user?.id), 200);
  }
  static async delete(req, projectId, milestoneId) {
    await MilestoneService.deleteMilestone(milestoneId, req.user?.id);
    return ApiResponse.success("Milestone deleted", null, 200);
  }
}
