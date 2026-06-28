import { CmsService } from "../services/cmsService";
import { cmsSchemas } from "../validators/cms";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";

export class CmsController {
  /**
   * Resolves validator schema matching the CMS module
   */
  static getValidator(modelName) {
    const validator = cmsSchemas[modelName];
    if (!validator) {
      throw new ValidationError(`Validation schema for CMS module '${modelName}' not found.`);
    }
    return validator;
  }

  /**
   * GET /api/admin/cms/[module]
   */
  static async getItems(req, modelName) {
    // If request contains authorization, return unpublished drafts as well
    const cookies = req.headers.get("cookie") || "";
    const hasToken = cookies.split(";").some((c) => c.trim().startsWith("accessToken="));

    const items = await CmsService.getItems(modelName, hasToken);
    return ApiResponse.success(`${modelName} items list retrieved`, items, 200);
  }

  /**
   * GET /api/admin/cms/[module]/[id]
   */
  static async getItemById(req, modelName, id) {
    const item = await CmsService.getItemById(modelName, id);
    return ApiResponse.success(`${modelName} item retrieved`, item, 200);
  }

  /**
   * POST /api/admin/cms/[module]
   */
  static async createItem(req, modelName) {
    const validator = this.getValidator(modelName);
    const body = await req.json();

    const parsed = validator.safeParse(body);
    if (!parsed.success) {
      const details = (parsed.error.issues || parsed.error.errors || []).map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      throw new ValidationError("Validation failed", details);
    }

    const userId = req.user?.id;
    const item = await CmsService.createItem(modelName, parsed.data, userId);
    return ApiResponse.success(`${modelName} item created successfully`, item, 201);
  }

  /**
   * PUT /api/admin/cms/[module]/[id]
   */
  static async updateItem(req, modelName, id) {
    const validator = this.getValidator(modelName);
    const body = await req.json();

    const parsed = validator.safeParse(body);
    if (!parsed.success) {
      const details = (parsed.error.issues || parsed.error.errors || []).map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      throw new ValidationError("Validation failed", details);
    }

    const userId = req.user?.id;
    const item = await CmsService.updateItem(modelName, id, parsed.data, userId);
    return ApiResponse.success(`${modelName} item updated successfully`, item, 200);
  }

  /**
   * DELETE /api/admin/cms/[module]/[id]
   */
  static async deleteItem(req, modelName, id) {
    const userId = req.user?.id;
    await CmsService.deleteItem(modelName, id, userId);
    return ApiResponse.success(`${modelName} item deleted successfully`, null, 200);
  }
}
