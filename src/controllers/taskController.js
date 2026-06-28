import { TaskService } from "../services/taskService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const taskSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
  milestoneId: z.string().optional().nullable(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  status: z.enum(["TODO", "DOING", "REVIEW", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable().transform((val) => (val ? new Date(val) : null)),
});

const commentSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

export class TaskController {
  static async create(req) {
    const body = await req.json();
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        "Validation failed",
        parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      );
    }
    const task = await TaskService.createTask(parsed.data, req.user?.id);
    return ApiResponse.success("Task created successfully", task, 201);
  }

  static async update(req, id) {
    const body = await req.json();
    const parsed = taskSchema.partial().safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        "Validation failed",
        parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      );
    }
    const task = await TaskService.updateTask(id, parsed.data, req.user?.id);
    return ApiResponse.success("Task updated successfully", task, 200);
  }

  static async getById(req, id) {
    const task = await TaskService.getTaskById(id);
    return ApiResponse.success("Task retrieved successfully", task, 200);
  }

  static async delete(req, id) {
    await TaskService.deleteTask(id, req.user?.id);
    return ApiResponse.success("Task deleted successfully", null, 200);
  }

  static async getList(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const filters = {
      skip: (page - 1) * limit,
      take: limit,
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      assigneeId: searchParams.get("assigneeId") || undefined,
      projectId: searchParams.get("projectId") || undefined,
      milestoneId: searchParams.get("milestoneId") || undefined,
      dueDate: searchParams.get("dueDate") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    };

    const result = await TaskService.getTasksList(filters);
    return ApiResponse.success("Tasks retrieved successfully", result.data, 200, result.pagination);
  }

  static async getMyTasks(req) {
    const userId = req.user?.id;
    if (!userId) throw new ValidationError("User ID context missing");
    const myTasks = await TaskService.getMyTasks(userId);
    return ApiResponse.success("My Tasks retrieved successfully", myTasks, 200);
  }

  static async getKanban(req) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const board = await TaskService.getKanbanBoard(projectId);
    return ApiResponse.success("Kanban board columns retrieved successfully", board, 200);
  }

  // Comments
  static async addComment(req, taskId) {
    const body = await req.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        "Validation failed",
        parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      );
    }
    const comment = await TaskService.addComment(taskId, parsed.data.message, req.user?.id);
    return ApiResponse.success("Comment added successfully", comment, 201);
  }

  static async getComments(req, taskId) {
    const comments = await TaskService.getComments(taskId);
    return ApiResponse.success("Comments retrieved successfully", comments, 200);
  }

  // Attachments
  static async uploadAttachment(req, taskId) {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw new ValidationError("No valid file attached");
    }
    const attachment = await TaskService.addAttachment(taskId, file, req.user?.id);
    return ApiResponse.success("Attachment uploaded successfully", attachment, 201);
  }

  static async getAttachments(req, taskId) {
    const attachments = await TaskService.getAttachments(taskId);
    return ApiResponse.success("Attachments retrieved successfully", attachments, 200);
  }

  static async deleteAttachment(req, taskId, attachmentId) {
    await TaskService.removeAttachment(attachmentId, req.user?.id);
    return ApiResponse.success("Attachment deleted successfully", null, 200);
  }

  static async getDashboard(req) {
    const stats = await TaskService.getTaskDashboardStats(req.user?.id);
    return ApiResponse.success("Task dashboard widgets retrieved successfully", stats, 200);
  }

  static async triggerOverdueCheck(req) {
    const count = await TaskService.checkOverdueTasksAndNotify();
    return ApiResponse.success(`Triggered overdue check. Notified ${count} users.`, { count }, 200);
  }
}
