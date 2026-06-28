import { DiscussionRepository } from "../repositories/discussionRepository";
import { ProjectRepository } from "../repositories/projectRepository";
import { AuditService } from "./auditService";
import { NotFoundError } from "../utils/errors";

export class DiscussionService {
  static async createDiscussion(projectId, data, userId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    const discussion = await DiscussionRepository.create({ ...data, projectId, authorId: userId });
    await AuditService.log("DISCUSSION_CREATE", { projectId, discussionId: discussion.id }, userId, null, discussion, "Discussion");
    return discussion;
  }

  static async getDiscussionsByProject(projectId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    return DiscussionRepository.findByProjectId(projectId);
  }

  static async addReply(discussionId, data, userId) {
    const discussion = await DiscussionRepository.findById(discussionId);
    if (!discussion) throw new NotFoundError("Discussion not found");
    const reply = await DiscussionRepository.addReply({ ...data, discussionId, authorId: userId });
    await AuditService.log("DISCUSSION_REPLY_CREATE", { discussionId, replyId: reply.id }, userId, null, reply, "DiscussionReply");
    return reply;
  }

  static async getReplies(discussionId) {
    const discussion = await DiscussionRepository.findById(discussionId);
    if (!discussion) throw new NotFoundError("Discussion not found");
    return DiscussionRepository.findReplies(discussionId);
  }
}
