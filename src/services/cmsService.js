import { CmsRepository } from "../repositories/cmsRepository";
import { AuditService } from "./auditService";
import { NotFoundError, ValidationError } from "../utils/errors";
import { CacheManager } from "../utils/cache";

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
    CacheManager.purgeCMSCache();
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
    CacheManager.purgeCMSCache();
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
    CacheManager.purgeCMSCache();
    return item;
  }

  /**
   * Clones a CMS content block as draft with a Copy title flag and unique slug
   */
  static async duplicateItem(modelName, id, userId) {
    const existing = await CmsRepository.findById(modelName, id);
    if (!existing) {
      throw new NotFoundError(`${modelName} item not found`);
    }

    const clone = { ...existing };
    delete clone.id;
    delete clone.createdAt;
    delete clone.updatedAt;
    delete clone.updatedBy;

    if (clone.title) clone.title = `${clone.title} - Copy`;
    if (clone.name) clone.name = `${clone.name} - Copy`;
    if (clone.platform) clone.platform = `${clone.platform} - Copy`;
    if (clone.question) clone.question = `${clone.question} - Copy`;
    if (clone.copyrightText) clone.copyrightText = `${clone.copyrightText} - Copy`;

    if (clone.slug) {
      clone.slug = `${clone.slug}-copy-${Math.random().toString(36).slice(2, 6)}`;
    }

    // Reset parameters to default drafts
    clone.isPublished = false;
    clone.displayOrder = (clone.displayOrder ?? 0) + 1;
    clone.updatedById = userId;

    const newItem = await CmsRepository.create(modelName, clone);
    await AuditService.log(
      "CMS_DUPLICATE",
      { modelName, sourceId: id, targetId: newItem.id },
      userId
    );
    CacheManager.purgeCMSCache();
    return newItem;
  }
}
