import { MediaRepository } from "../repositories/mediaRepository";
import { AuditService } from "./auditService";
import { ValidationError, NotFoundError } from "../utils/errors";
import cloudinary from "../config/cloudinary";
import logger from "../utils/logger";

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
    altText = null
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
      uploadedById: userId,
    });

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
   * Deletes asset from Cloudinary storage and database records
   */
  static async deleteAsset(id, userId) {
    const asset = await MediaRepository.findById(id);
    if (!asset) {
      throw new NotFoundError("Media asset not found");
    }

    let resourceType = "image";
    if (asset.fileType === "video") {
      resourceType = "video";
    } else if (asset.fileType === "raw") {
      resourceType = "raw";
    }

    try {
      await new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(
          asset.publicId,
          { resource_type: resourceType },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
      });
    } catch (err) {
      logger.error({ err, publicId: asset.publicId }, "Cloudinary file deletion failed, continuing DB cleanup");
    }

    await MediaRepository.delete(id);
    await AuditService.log("MEDIA_DELETE", { assetId: id, publicId: asset.publicId }, userId);
    return true;
  }
}
