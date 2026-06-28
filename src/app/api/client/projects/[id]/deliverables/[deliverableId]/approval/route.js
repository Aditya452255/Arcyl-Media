import { ClientPortalController } from "../../../../../../../../controllers/clientPortalController";
import { withClientAuth } from "../../../../../../../../middleware/clientAuthMiddleware";
import { withErrorHandler } from "../../../../../../../../middleware/errorHandler";

export const POST = withErrorHandler(
  withClientAuth(async (req, { params }) => {
    const { id, deliverableId } = await params;
    return await ClientPortalController.handleDeliverableApproval(req, id, deliverableId);
  })
);
