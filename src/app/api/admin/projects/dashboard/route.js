import { ProjectDashboardController } from "../../../../../controllers/projectDashboardController";
import { withErrorHandler } from "../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../middleware/authMiddleware";

export const GET = withErrorHandler(withPermission("Dashboard.Read", (req) => ProjectDashboardController.get(req)));
