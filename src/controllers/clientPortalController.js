import { ClientPortalService } from "../services/clientPortalService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const messageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
  attachments: z.array(z.string()).optional().nullable(),
});

const approvalSchema = z.object({
  approved: z.boolean(),
  feedback: z.string().optional().nullable(),
});

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  profilePicture: z.string().optional().nullable(),
});

const requestProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Project details/description is required"),
});

export class ClientPortalController {
  static async getDashboard(req) {
    const { clientId, id: userId } = req.user;
    const stats = await ClientPortalService.getDashboardSummary(clientId, userId);
    return ApiResponse.success("Client dashboard retrieved successfully", stats, 200);
  }

  static async getProjects(req) {
    const { clientId } = req.user;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const list = await ClientPortalService.getProjects(clientId, { search });
    return ApiResponse.success("Client projects retrieved successfully", list, 200);
  }

  static async getProjectDetails(req, projectId) {
    const { clientId } = req.user;
    const details = await ClientPortalService.getProjectDetails(clientId, projectId);
    return ApiResponse.success("Project details retrieved successfully", details, 200);
  }

  static async getDeliverables(req, projectId) {
    const { clientId } = req.user;
    const list = await ClientPortalService.getDeliverables(clientId, projectId);
    return ApiResponse.success("Deliverables retrieved successfully", list, 200);
  }

  static async handleDeliverableApproval(req, projectId, deliverableId) {
    const { clientId, id: userId } = req.user;
    const body = await req.json();
    const parsed = approvalSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        "Validation failed",
        parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      );
    }
    const updated = await ClientPortalService.processDeliverableApproval(
      clientId,
      projectId,
      deliverableId,
      parsed.data.approved,
      parsed.data.feedback,
      userId
    );
    return ApiResponse.success("Deliverable approval status saved", updated, 200);
  }

  static async getFiles(req, projectId) {
    const { clientId } = req.user;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const list = await ClientPortalService.getFiles(clientId, projectId, { search });
    return ApiResponse.success("Project shared files retrieved", list, 200);
  }

  static async uploadFile(req, projectId) {
    const { clientId, id: userId } = req.user;
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      throw new ValidationError("No valid file attached");
    }
    const projectFile = await ClientPortalService.uploadClientFile(clientId, projectId, file, userId);
    return ApiResponse.success("Shared file uploaded successfully", projectFile, 201);
  }

  static async getMessages(req, projectId) {
    const { clientId, id: userId } = req.user;
    const list = await ClientPortalService.getMessages(clientId, projectId, userId);
    return ApiResponse.success("Conversation messages thread retrieved", list, 200);
  }

  static async sendMessage(req, projectId) {
    const { clientId, id: userId } = req.user;
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        "Validation failed",
        parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      );
    }
    const msg = await ClientPortalService.sendMessage(clientId, projectId, parsed.data.content, parsed.data.attachments, userId);
    return ApiResponse.success("Message sent successfully", msg, 201);
  }

  static async updateProfile(req) {
    const { id: userId, clientId } = req.user;
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        "Validation failed",
        parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      );
    }
    const updated = await ClientPortalService.updateProfile(userId, clientId, parsed.data);
    return ApiResponse.success("Profile updated successfully", updated, 200);
  }

  static async requestProject(req) {
    const { clientId, id: userId } = req.user;
    const body = await req.json();
    const parsed = requestProjectSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        "Validation failed",
        parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      );
    }
    const project = await ClientPortalService.requestProject(clientId, userId, parsed.data);
    return ApiResponse.success("Project enquiry submitted successfully", project, 201);
  }
}
