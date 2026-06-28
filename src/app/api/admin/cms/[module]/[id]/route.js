import { CmsController } from "../../../../../../controllers/cmsController";
import { withErrorHandler } from "../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../middleware/authMiddleware";

/**
 * GET /api/admin/cms/[module]/[id]
 * Fetch individual item detail
 */
export const GET = withErrorHandler(async (req, { params }) => {
  const { module, id } = await params;
  return await CmsController.getItemById(req, module, id);
});

/**
 * PUT /api/admin/cms/[module]/[id]
 * Update a CMS item (guarded by CMS.Update node)
 */
export const PUT = withErrorHandler(async (req, { params }) => {
  const { module, id } = await params;
  const wrapped = withPermission("CMS.Update", async (r) => {
    return await CmsController.updateItem(r, module, id);
  });
  return await wrapped(req);
});

/**
 * DELETE /api/admin/cms/[module]/[id]
 * Delete/Soft-delete a CMS item (guarded by CMS.Delete node)
 */
export const DELETE = withErrorHandler(async (req, { params }) => {
  const { module, id } = await params;
  const wrapped = withPermission("CMS.Delete", async (r) => {
    return await CmsController.deleteItem(r, module, id);
  });
  return await wrapped(req);
});
