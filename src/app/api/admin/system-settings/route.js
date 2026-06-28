import { SystemSettingController } from "../../../../controllers/systemSettingController";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withPermission } from "../../../../middleware/authMiddleware";

export const GET = withErrorHandler(
  withPermission("Dashboard.Read", async (req) => {
    return await SystemSettingController.list(req);
  })
);

export const POST = withErrorHandler(
  withPermission("Dashboard.Read", async (req) => {
    return await SystemSettingController.set(req);
  })
);
