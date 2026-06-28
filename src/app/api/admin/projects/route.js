import { ProjectController } from "../../../../controllers/projectController";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withPermission } from "../../../../middleware/authMiddleware";

export const GET = withErrorHandler(withPermission("Dashboard.Read", (req) => ProjectController.getList(req)));
export const POST = withErrorHandler(withPermission("Dashboard.Read", (req) => ProjectController.create(req)));
