import prisma from "../config/db";

export class MediaRepository {
  static async create(data) {
    return prisma.mediaAsset.create({ data });
  }

  static async findById(id) {
    return prisma.mediaAsset.findUnique({
      where: { id },
    });
  }

  static async delete(id) {
    return prisma.mediaAsset.delete({
      where: { id },
    });
  }

  /**
   * Retrieves list of uploaded media items paginated
   */
  static async findManyPaginated({ page = 1, limit = 20, search }) {
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { altText: { contains: search, mode: "insensitive" } },
        { folder: { contains: search, mode: "insensitive" } },
        { fileType: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.mediaAsset.count({ where }),
      prisma.mediaAsset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          uploadedBy: { select: { id: true, name: true, email: true } },
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
}
