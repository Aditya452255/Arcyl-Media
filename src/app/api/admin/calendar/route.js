import { CalendarController } from "../../../../controllers/calendarController";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withPermission } from "../../../../middleware/authMiddleware";

export const GET = withErrorHandler(withPermission("Dashboard.Read", (req) => CalendarController.list(req)));
export const POST = withErrorHandler(withPermission("Dashboard.Read", (req) => CalendarController.create(req)));
