import { TimeEntryController } from "../../../../../../../controllers/timeEntryController";
import { withErrorHandler } from "../../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../../middleware/authMiddleware";

export const GET = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => TimeEntryController.summary(req, p.id))));
