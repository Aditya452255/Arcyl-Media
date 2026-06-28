import prisma from "../config/db";

export class LeadRepository {
  static async findByEmail(email) {
    return prisma.lead.findUnique({
      where: { email },
    });
  }

  static async findById(id) {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        notes: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        submissions: true,
      },
    });
  }

  static async create(data) {
    return prisma.lead.create({
      data,
    });
  }

  static async update(id, data) {
    return prisma.lead.update({
      where: { id },
      data,
    });
  }

  static async delete(id) {
    return prisma.lead.delete({
      where: { id },
    });
  }

  /**
   * Paginated find with search, status filters, sorting and ordering.
   */
  static async findManyPaginated({
    page = 1,
    limit = 10,
    search,
    sort = "createdAt",
    order = "desc",
    status,
    isArchived,
  }) {
    const skip = (page - 1) * limit;

    const where = {
      isArchived: isArchived !== undefined ? isArchived : false,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const allowedSorts = ["name", "email", "status", "createdAt", "updatedAt"];
    const sortField = allowedSorts.includes(sort) ? sort : "createdAt";
    const sortOrder = ["asc", "desc"].includes(order.toLowerCase()) ? order.toLowerCase() : "desc";

    const [total, data] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortField]: sortOrder,
        },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages,
        hasNext: page < pages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Appends note to Lead history
   */
  static async addNote(leadId, authorId, content) {
    return prisma.leadNote.create({
      data: {
        leadId,
        authorId,
        content,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
