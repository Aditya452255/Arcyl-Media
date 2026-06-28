import { NotificationController } from "../../../../controllers/notificationController";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withPermission } from "../../../../middleware/authMiddleware";

export const GET = withErrorHandler(
  withPermission("Dashboard.Read", async (req) => {
    return await NotificationController.list(req);
  })
);
