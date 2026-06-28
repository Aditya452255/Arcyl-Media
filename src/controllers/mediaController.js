import { MediaService } from "../services/mediaService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";

export class MediaController {
  /**
   * POST /api/admin/media
   */
  static async upload(req) {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "arcyl_media";
    const altText = formData.get("altText") || null;

    if (!file || !(file instanceof File)) {
      throw new ValidationError("No valid file attached to 'file' property.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const userId = req.user?.id;

    const asset = await MediaService.uploadFile(
      buffer,
      file.name,
      file.type,
      file.size,
      folder,
      userId,
      altText
    );

    return ApiResponse.success("Media uploaded successfully", asset, 201);
  }

  /**
   * GET /api/admin/media
   */
  static async getAssets(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || undefined;

    const result = await MediaService.getAssets({ page, limit, search });
    return ApiResponse.success("Media assets retrieved successfully", result.data, 200, result.pagination);
  }

  /**
   * DELETE /api/admin/media/[id]
   */
  static async deleteAsset(req, id) {
    const userId = req.user?.id;
    await MediaService.deleteAsset(id, userId);
    return ApiResponse.success("Media asset deleted successfully", null, 200);
  }
}
