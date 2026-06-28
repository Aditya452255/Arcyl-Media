import { ClientPortalController } from "../../../../../../controllers/clientPortalController";
import { withClientAuth } from "../../../../../../middleware/clientAuthMiddleware";
import { withErrorHandler } from "../../../../../../middleware/errorHandler";

export const GET = withErrorHandler(
  withClientAuth(async (req, { params }) => {
    const { id } = await params;
    return await ClientPortalController.getDeliverables(req, id);
  })
);
