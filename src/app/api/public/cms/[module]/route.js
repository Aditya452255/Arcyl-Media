import { PublicCmsController } from "../../../../../controllers/publicCmsController";
import { withErrorHandler } from "../../../../../middleware/errorHandler";

/**
 * GET /api/public/cms/[module]
 * Public unauthenticated dynamic content retrieval route handler.
 */
export const GET = withErrorHandler(async (req, { params }) => {
  const { module } = await params;
  return await PublicCmsController.getItems(req, module);
});
