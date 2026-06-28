import { LeadController } from "../../../../controllers/leadController";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withPermission } from "../../../../middleware/authMiddleware";

/**
 * GET /api/admin/leads
 * Retrieves paginated leads (guarded by Lead.Read permission node)
 */
export const GET = withErrorHandler(
  withPermission("Lead.Read", async (req) => {
    return await LeadController.getLeads(req);
  })
);
