import { CmsController } from "../../../../../../../controllers/cmsController";
import { withErrorHandler } from "../../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../../middleware/authMiddleware";

/**
 * POST /api/admin/cms/[module]/[id]/duplicate
 * Clones a CMS block item (guarded by CMS.Create node)
 */
export const POST = withErrorHandler(async (req, { params }) => {
  const { module, id } = await params;
  const wrapped = withPermission("CMS.Create", async (r) => {
    return await CmsController.duplicateItem(r, module, id);
  });
  return await wrapped(req);
});
