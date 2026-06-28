import { ClientPortalController } from "../../../../controllers/clientPortalController";
import { withClientAuth } from "../../../../middleware/clientAuthMiddleware";
import { withErrorHandler } from "../../../../middleware/errorHandler";

export const GET = withErrorHandler(
  withClientAuth(async (req) => {
    return await ClientPortalController.getProjects(req);
  })
);

export const POST = withErrorHandler(
  withClientAuth(async (req) => {
    return await ClientPortalController.requestProject(req);
  })
);
