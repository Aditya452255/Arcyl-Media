import { MediaController } from "../../../../controllers/mediaController";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withAuth, withPermission } from "../../../../middleware/authMiddleware";

/**
 * GET /api/admin/media -> Read media files (requires authenticated session)
 * POST /api/admin/media -> Upload new file (requires Media.Upload permission)
 */
export const GET = withErrorHandler(
  withAuth(async (req) => {
    return await MediaController.getAssets(req);
  })
);

export const POST = withErrorHandler(
  withPermission("Media.Upload", async (req) => {
    return await MediaController.upload(req);
  })
);
