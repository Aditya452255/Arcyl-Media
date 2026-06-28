import prisma from "../config/db";

const authorInclude = { select: { id: true, name: true, email: true } };

export class DiscussionRepository {
  static async create(data) {
    return prisma.discussion.create({ data, include: { author: authorInclude } });
  }

  static async findByProjectId(projectId) {
    return prisma.discussion.findMany({
      where: { projectId, isDeleted: false },
      include: {
        author: authorInclude,
        replies: {
          where: { isDeleted: false },
          include: { author: authorInclude },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id) {
    return prisma.discussion.findFirst({
      where: { id, isDeleted: false },
      include: { author: authorInclude },
    });
  }

  static async softDelete(id) {
    return prisma.discussion.update({ where: { id }, data: { isDeleted: true } });
  }

  static async addReply(data) {
    return prisma.discussionReply.create({ data, include: { author: authorInclude } });
  }

  static async findReplies(discussionId) {
    return prisma.discussionReply.findMany({
      where: { discussionId, isDeleted: false },
      include: { author: authorInclude },
      orderBy: { createdAt: "asc" },
    });
  }
}
