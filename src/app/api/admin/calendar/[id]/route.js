import { CalendarController } from "../../../../../controllers/calendarController";
import { withErrorHandler } from "../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../middleware/authMiddleware";

export const PUT = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => CalendarController.update(req, p.id))));
export const DELETE = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => CalendarController.delete(req, p.id))));
