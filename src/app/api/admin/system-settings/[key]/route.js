import { SystemSettingController } from "../../../../../controllers/systemSettingController";
import { withErrorHandler } from "../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../middleware/authMiddleware";

export const GET = withErrorHandler(
  withPermission("Dashboard.Read", async (req, { params }) => {
    const { key } = await params;
    return await SystemSettingController.getByKey(req, key);
  })
);

export const DELETE = withErrorHandler(
  withPermission("Dashboard.Read", async (req, { params }) => {
    const { key } = await params;
    return await SystemSettingController.delete(req, key);
  })
);
