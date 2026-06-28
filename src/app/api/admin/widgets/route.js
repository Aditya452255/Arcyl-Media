import { WidgetController } from "../../../../controllers/widgetController";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withPermission } from "../../../../middleware/authMiddleware";

export const GET = withErrorHandler(
  withPermission("Dashboard.Read", async (req) => {
    return await WidgetController.list(req);
  })
);

export const POST = withErrorHandler(
  withPermission("Dashboard.Read", async (req) => {
    return await WidgetController.save(req);
  })
);
