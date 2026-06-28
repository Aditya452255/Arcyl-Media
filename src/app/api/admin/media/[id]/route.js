import { MediaController } from "../../../../../controllers/mediaController";
import { withErrorHandler } from "../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../middleware/authMiddleware";

/**
 * PUT /api/admin/media/[id]
 * Updates media asset details (altText, tags, collections, etc)
 */
export const PUT = withErrorHandler(
  withPermission("Media.Upload", async (req, { params }) => {
    const { id } = await params;
    return await MediaController.update(req, id);
  })
);

/**
 * DELETE /api/admin/media/[id]
 * Deletes media asset from DB catalog
 */
export const DELETE = withErrorHandler(
  withPermission("Media.Delete", async (req, { params }) => {
    const { id } = await params;
    return await MediaController.deleteAsset(req, id);
  })
);
