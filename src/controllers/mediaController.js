import { MediaService } from "../services/mediaService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const updateMediaSchema = z.object({
  altText: z.string().optional().nullable(),
  folder: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  collectionName: z.string().optional().nullable(),
  version: z.number().int().optional(),
});

export class MediaController {
  /**
   * POST /api/admin/media
   */
  static async upload(req) {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "arcyl_media";
    const altText = formData.get("altText") || null;
    const collectionName = formData.get("collectionName") || null;

    // tags could be a comma separated string or JSON list
    let tags = [];
    const tagsParam = formData.get("tags");
    if (tagsParam) {
      try {
        tags = JSON.parse(tagsParam);
      } catch (e) {
        tags = String(tagsParam)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

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
      altText,
      tags,
      collectionName
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
    const folder = searchParams.get("folder") || undefined;
    const collectionName = searchParams.get("collectionName") || undefined;
    const tag = searchParams.get("tag") || undefined;

    const result = await MediaService.getAssets({
      page,
      limit,
      search,
      folder,
      collectionName,
      tag,
    });
    return ApiResponse.success("Media assets retrieved successfully", result.data, 200, result.pagination);
  }

  /**
   * PUT /api/admin/media/[id]
   */
  static async update(req, id) {
    const body = await req.json();
    const parsed = updateMediaSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      throw new ValidationError("Validation failed", details);
    }

    const userId = req.user?.id;
    const asset = await MediaService.updateAsset(id, parsed.data, userId);
    return ApiResponse.success("Media asset updated successfully", asset, 200);
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
