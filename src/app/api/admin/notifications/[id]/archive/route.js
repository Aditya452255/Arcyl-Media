import { NotificationController } from "../../../../../../controllers/notificationController";
import { withErrorHandler } from "../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../middleware/authMiddleware";

export const POST = withErrorHandler(
  withPermission("Dashboard.Read", async (req, { params }) => {
    const { id } = await params;
    return await NotificationController.archive(req, id);
  })
);
