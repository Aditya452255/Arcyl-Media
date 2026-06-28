import prisma from "../config/db";

export class MediaRepository {
  static async create(data) {
    return prisma.mediaAsset.create({ data });
  }

  static async findById(id) {
    return prisma.mediaAsset.findFirst({
      where: { id, isDeleted: false },
    });
  }

  static async update(id, data) {
    return prisma.mediaAsset.update({
      where: { id },
      data,
    });
  }

  static async delete(id) {
    // Soft delete support by default
    return prisma.mediaAsset.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  /**
   * Retrieves list of uploaded media items paginated with folder, tag and collection filters
   */
  static async findManyPaginated({
    page = 1,
    limit = 20,
    search = "",
    folder,
    collectionName,
    tag,
  }) {
    const skip = (page - 1) * limit;

    const where = { isDeleted: false };

    if (folder) {
      where.folder = folder;
    }

    if (collectionName) {
      where.collectionName = collectionName;
    }

    if (tag) {
      where.tags = {
        array_contains: tag, // Postgres native JSON array search compatibility helper
      };
    }

    if (search) {
      where.OR = [
        { altText: { contains: search, mode: "insensitive" } },
        { folder: { contains: search, mode: "insensitive" } },
        { collectionName: { contains: search, mode: "insensitive" } },
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
