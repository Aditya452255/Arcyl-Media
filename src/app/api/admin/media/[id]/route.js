import { MediaController } from "../../../../../controllers/mediaController";
import { withErrorHandler } from "../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../middleware/authMiddleware";

/**
 * DELETE /api/admin/media/[id]
 * Deletes media asset from storage and DB catalog (guarded by Media.Delete permission node)
 */
export const DELETE = withErrorHandler(
  withPermission("Media.Delete", async (req, { params }) => {
    const { id } = await params;
    return await MediaController.deleteAsset(req, id);
  })
);
