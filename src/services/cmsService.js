import { CmsRepository } from "../repositories/cmsRepository";
import { AuditService } from "./auditService";
import { NotFoundError, ValidationError } from "../utils/errors";

export class CmsService {
  /**
   * Retrieves items of a CMS module
   */
  static async getItems(modelName, includeUnpublished = false) {
    const filters = {};
    if (!includeUnpublished) {
      // SiteSetting and Footer do not have publish flags
      if (!["siteSetting", "footer"].includes(modelName)) {
        filters.isPublished = true;
      }
    }
    return CmsRepository.findMany(modelName, filters);
  }

  /**
   * Retrieves single item by ID
   */
  static async getItemById(modelName, id) {
    const item = await CmsRepository.findById(modelName, id);
    if (!item) {
      throw new NotFoundError(`${modelName} item not found`);
    }
    return item;
  }

  /**
   * Creates a new CMS item
   */
  static async createItem(modelName, data, userId) {
    if (data.slug) {
      const existing = await CmsRepository.findBySlug(modelName, data.slug);
      if (existing) {
        throw new ValidationError(`Slug "${data.slug}" is already registered.`);
      }
    }

    const payload = {
      ...data,
      updatedById: userId,
    };

    const item = await CmsRepository.create(modelName, payload);
    await AuditService.log("CMS_CREATE", { modelName, resourceId: item.id }, userId);
    return item;
  }

  /**
   * Updates an existing CMS item
   */
  static async updateItem(modelName, id, data, userId) {
    const existing = await CmsRepository.findById(modelName, id);
    if (!existing) {
      throw new NotFoundError(`${modelName} item not found`);
    }

    if (data.slug && data.slug !== existing.slug) {
      const conflict = await CmsRepository.findBySlug(modelName, data.slug);
      if (conflict) {
        throw new ValidationError(`Slug "${data.slug}" is already registered.`);
      }
    }

    const payload = {
      ...data,
      updatedById: userId,
    };

    const item = await CmsRepository.update(modelName, id, payload);
    await AuditService.log(
      "CMS_UPDATE",
      {
        modelName,
        resourceId: id,
        oldValue: existing,
        newValue: item,
      },
      userId
    );
    return item;
  }

  /**
   * Deletes a CMS item (soft deletes standard modules, hard deletes setting modules)
   */
  static async deleteItem(modelName, id, userId) {
    const existing = await CmsRepository.findById(modelName, id);
    if (!existing) {
      throw new NotFoundError(`${modelName} item not found`);
    }

    let item;
    if (["siteSetting", "footer"].includes(modelName)) {
      const model = CmsRepository.getModel(modelName);
      item = await model.delete({ where: { id } });
    } else {
      item = await CmsRepository.softDelete(modelName, id, userId);
    }

    await AuditService.log("CMS_DELETE", { modelName, resourceId: id }, userId);
    return item;
  }
}
