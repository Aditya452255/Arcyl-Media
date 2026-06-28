import { DiscussionService } from "../services/discussionService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const discussionSchema = z.object({
  content: z.string().min(1, "Content is required"),
  mentions: z.array(z.string()).optional().nullable(),
});

export class DiscussionController {
  static async list(req, projectId) {
    return ApiResponse.success("Discussions retrieved", await DiscussionService.getDiscussionsByProject(projectId), 200);
  }
  static async create(req, projectId) {
    const body = await req.json();
    const parsed = discussionSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Discussion created", await DiscussionService.createDiscussion(projectId, parsed.data, req.user?.id), 201);
  }
  static async listReplies(req, projectId, discussionId) {
    return ApiResponse.success("Replies retrieved", await DiscussionService.getReplies(discussionId), 200);
  }
  static async addReply(req, projectId, discussionId) {
    const body = await req.json();
    const parsed = discussionSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Reply added", await DiscussionService.addReply(discussionId, parsed.data, req.user?.id), 201);
  }
}
