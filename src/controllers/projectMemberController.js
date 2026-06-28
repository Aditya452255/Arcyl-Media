import { ProjectMemberService } from "../services/projectMemberService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const schema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  role: z.string().default("Member"),
  allocationPercent: z.number().int().min(0).max(100).default(100),
});

export class ProjectMemberController {
  static async list(req, projectId) {
    return ApiResponse.success("Members retrieved", await ProjectMemberService.getMembersByProject(projectId), 200);
  }
  static async add(req, projectId) {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Member added", await ProjectMemberService.addMember(projectId, parsed.data, req.user?.id), 201);
  }
  static async update(req, projectId, memberId) {
    const body = await req.json();
    const parsed = schema.partial().safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Member updated", await ProjectMemberService.updateMember(memberId, parsed.data, req.user?.id), 200);
  }
  static async remove(req, projectId, memberId) {
    await ProjectMemberService.removeMember(memberId, req.user?.id);
    return ApiResponse.success("Member removed", null, 200);
  }
}
