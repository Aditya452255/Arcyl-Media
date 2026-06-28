import { PublicCmsController } from "../../../../controllers/publicCmsController";
import { withErrorHandler } from "../../../../middleware/errorHandler";

/**
 * GET /api/public/settings
 * Public unauthenticated settings configurations retrieval route.
 */
export const GET = withErrorHandler(async (req) => {
  return await PublicCmsController.getSettings(req);
});
