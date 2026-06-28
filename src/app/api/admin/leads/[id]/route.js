import { LeadController } from "../../../../../controllers/leadController";
import { withErrorHandler } from "../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../middleware/authMiddleware";

/**
 * GET /api/admin/leads/[id]
 * Read single lead details
 */
export const GET = withErrorHandler(
  withPermission("Lead.Read", async (req, { params }) => {
    const { id } = await params;
    return await LeadController.getLeadById(req, id);
  })
);

/**
 * PATCH /api/admin/leads/[id]
 * Edit lead details
 */
export const PATCH = withErrorHandler(
  withPermission("Lead.Update", async (req, { params }) => {
    const { id } = await params;
    return await LeadController.updateLead(req, id);
  })
);

/**
 * DELETE /api/admin/leads/[id]
 * Hard delete lead record
 */
export const DELETE = withErrorHandler(
  withPermission("Lead.Delete", async (req, { params }) => {
    const { id } = await params;
    return await LeadController.deleteLead(req, id);
  })
);
