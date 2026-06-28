import { OrganizationController } from "../../../../controllers/organizationController";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withPermission } from "../../../../middleware/authMiddleware";

export const GET = withErrorHandler(
  withPermission("Dashboard.Read", async (req) => {
    return await OrganizationController.get(req);
  })
);

export const PUT = withErrorHandler(
  withPermission("Dashboard.Read", async (req) => {
    return await OrganizationController.update(req);
  })
);
