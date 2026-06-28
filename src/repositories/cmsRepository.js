import prisma from "../config/db";

const mapModelName = (name) => {
  const mapping = {
    hero: "hero",
    about: "about",
    service: "service",
    portfolio: "portfolio",
    testimonial: "testimonial",
    faq: "fAQ",
    technology: "technology",
    teamMember: "teamMember",
    siteSetting: "siteSetting",
    socialLink: "socialLink",
    footer: "footer",
  };
  return mapping[name] || name;
};

export class CmsRepository {
  /**
   * Resolve dynamic Prisma model delegate
   */
  static getModel(modelName) {
    const prismaModel = mapModelName(modelName);
    if (!prisma[prismaModel]) {
      throw new Error(`CMS Model '${modelName}' not recognized`);
    }
    return prisma[prismaModel];
  }

  static async findMany(modelName, filters = {}, options = {}) {
    const model = this.getModel(modelName);
    // SiteSetting and Footer do not have isDeleted flags
    const hasSoftDelete = !["siteSetting", "footer"].includes(modelName);

    return model.findMany({
      where: {
        ...(hasSoftDelete ? { isDeleted: false } : {}),
        ...filters,
      },
      ...(modelName !== "siteSetting" && modelName !== "footer"
        ? { orderBy: { displayOrder: "asc" } }
        : {}),
      ...options,
    });
  }

  static async findById(modelName, id) {
    const model = this.getModel(modelName);
    const hasSoftDelete = !["siteSetting", "footer"].includes(modelName);

    return model.findFirst({
      where: {
        id,
        ...(hasSoftDelete ? { isDeleted: false } : {}),
      },
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async findBySlug(modelName, slug) {
    const model = this.getModel(modelName);
    const hasSoftDelete = !["siteSetting", "footer"].includes(modelName);

    return model.findFirst({
      where: {
        slug,
        ...(hasSoftDelete ? { isDeleted: false } : {}),
      },
    });
  }

  static async create(modelName, data) {
    const model = this.getModel(modelName);
    return model.create({ data });
  }

  static async update(modelName, id, data) {
    const model = this.getModel(modelName);
    return model.update({
      where: { id },
      data,
    });
  }

  static async softDelete(modelName, id, userId) {
    const model = this.getModel(modelName);
    return model.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedById: userId,
      },
    });
  }
}
