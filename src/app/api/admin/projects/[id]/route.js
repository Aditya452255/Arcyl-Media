import { ProjectController } from "../../../../../controllers/projectController";
import { withErrorHandler } from "../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../middleware/authMiddleware";

export const GET = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ProjectController.getById(req, p.id))));
export const PUT = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ProjectController.update(req, p.id))));
export const DELETE = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ProjectController.delete(req, p.id))));
