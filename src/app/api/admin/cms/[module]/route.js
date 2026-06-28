import { CmsController } from "../../../../../controllers/cmsController";
import { withErrorHandler } from "../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../middleware/authMiddleware";

/**
 * GET /api/admin/cms/[module]
 * public/admin items list fetcher
 */
export const GET = withErrorHandler(async (req, { params }) => {
  const { module } = await params;
  return await CmsController.getItems(req, module);
});

/**
 * POST /api/admin/cms/[module]
 * Creates a CMS block item (guarded by CMS.Create node)
 */
export const POST = withErrorHandler(async (req, { params }) => {
  const { module } = await params;
  const wrapped = withPermission("CMS.Create", async (r) => {
    return await CmsController.createItem(r, module);
  });
  return await wrapped(req);
});
