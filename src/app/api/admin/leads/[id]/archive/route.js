import { LeadController } from "../../../../../../controllers/leadController";
import { withErrorHandler } from "../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../middleware/authMiddleware";

/**
 * POST /api/admin/leads/[id]/archive
 * Archives or restores a lead record (guarded by Lead.Update permission node)
 */
export const POST = withErrorHandler(
  withPermission("Lead.Update", async (req, { params }) => {
    const { id } = await params;
    return await LeadController.archiveLead(req, id);
  })
);
