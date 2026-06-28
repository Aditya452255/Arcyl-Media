import { MediaRepository } from "../repositories/mediaRepository";
import { AuditService } from "./auditService";
import { ValidationError, NotFoundError } from "../utils/errors";
import cloudinary from "../config/cloudinary";
import logger from "../utils/logger";
import { NotificationService } from "./notificationService";

export class MediaService {
  /**
   * Streams a file buffer directly to Cloudinary and saves resource details in PostgreSQL
   */
  static async uploadFile(
    fileBuffer,
    filename,
    mimeType,
    size,
    folder = "arcyl_media",
    userId = null,
    altText = null,
    tags = [],
    collectionName = null
  ) {
    if (!fileBuffer) {
      throw new ValidationError("No file buffer provided for uploading");
    }

    let fileType = "raw";
    if (mimeType.startsWith("image/")) {
      fileType = "image";
    } else if (mimeType.startsWith("video/")) {
      fileType = "video";
    }

    logger.info({ filename, mimeType, size }, "Uploading file to Cloudinary...");

    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            logger.error({ error }, "Cloudinary upload stream failure");
            return reject(error);
          }
          resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });

    const result = await uploadPromise;

    const asset = await MediaRepository.create({
      url: result.secure_url,
      publicId: result.public_id,
      fileType,
      mimeType,
      size,
      folder,
      altText: altText || filename,
      tags: tags || [],
      collectionName,
      uploadedById: userId,
    });

    try {
      await NotificationService.notifyAll(
        "Media Uploaded",
        `New media asset "${asset.altText}" was uploaded to folder "${asset.folder}".`,
        "MEDIA_UPLOADED"
      );
    } catch (err) {
      // Don't fail the upload if notification system errors
    }

    await AuditService.log("MEDIA_UPLOAD", { assetId: asset.id, publicId: asset.publicId }, userId);
    return asset;
  }

  /**
   * Retrieves paginated media catalog
   */
  static async getAssets(params) {
    return MediaRepository.findManyPaginated(params);
  }

  /**
   * Updates an existing media asset details
   */
  static async updateAsset(id, data, userId) {
    const existing = await MediaRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Media asset not found");
    }

    const updated = await MediaRepository.update(id, data);

    await AuditService.log("MEDIA_UPDATE", { assetId: id }, userId, existing, updated, "MediaAsset");
    return updated;
  }

  /**
   * Soft deletes asset from local catalog database records
   */
  static async deleteAsset(id, userId) {
    const asset = await MediaRepository.findById(id);
    if (!asset) {
      throw new NotFoundError("Media asset not found");
    }

    // Since we upgraded to soft delete, we leave Cloudinary untouched to support version history,
    // and only flag the local record as soft deleted
    await MediaRepository.delete(id);
    await AuditService.log("MEDIA_DELETE", { assetId: id, publicId: asset.publicId }, userId);
    return true;
  }
}
