import { ClientPortalController } from "../../../../controllers/clientPortalController";
import { withClientAuth } from "../../../../middleware/clientAuthMiddleware";
import { withErrorHandler } from "../../../../middleware/errorHandler";

export const PUT = withErrorHandler(
  withClientAuth(async (req) => {
    return await ClientPortalController.updateProfile(req);
  })
);
