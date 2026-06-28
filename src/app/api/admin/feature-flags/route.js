import { FeatureFlagController } from "../../../../controllers/featureFlagController";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withPermission } from "../../../../middleware/authMiddleware";

export const GET = withErrorHandler(
  withPermission("Dashboard.Read", async (req) => {
    return await FeatureFlagController.list(req);
  })
);

export const POST = withErrorHandler(
  withPermission("Dashboard.Read", async (req) => {
    return await FeatureFlagController.toggle(req);
  })
);
