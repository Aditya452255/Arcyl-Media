import { ProjectService } from "../services/projectService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).default("PLANNING"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  budget: z.number().optional().nullable(),
  startDate: z.string().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  deadline: z.string().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  progress: z.number().int().min(0).max(100).default(0),
  tags: z.array(z.string()).optional().nullable(),
});

export class ProjectController {
  static async create(req) {
    const body = await req.json();
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Project created", await ProjectService.createProject(parsed.data, req.user?.id), 201);
  }

  static async update(req, id) {
    const body = await req.json();
    const parsed = projectSchema.partial().safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Project updated", await ProjectService.updateProject(id, parsed.data, req.user?.id), 200);
  }

  static async getById(req, id) {
    return ApiResponse.success("Project retrieved", await ProjectService.getProjectById(id), 200);
  }

  static async delete(req, id) {
    await ProjectService.softDeleteProject(id, req.user?.id);
    return ApiResponse.success("Project deleted", null, 200);
  }

  static async getList(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const result = await ProjectService.getProjectsList({
      skip: (page - 1) * limit, take: limit,
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      clientId: searchParams.get("clientId") || undefined,
      managerId: searchParams.get("managerId") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });
    return ApiResponse.success("Projects retrieved", result.data, 200, result.pagination);
  }

  static async getKanban(req) {
    return ApiResponse.success("Kanban view retrieved", await ProjectService.getKanbanView(), 200);
  }

  static async getDashboard(req) {
    return ApiResponse.success("Dashboard retrieved", await ProjectService.getDashboard(), 200);
  }
}
