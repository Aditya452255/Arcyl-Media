import { ClientController } from "../../../../../controllers/clientController";
import { withErrorHandler } from "../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../middleware/authMiddleware";

export const GET = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ClientController.getById(req, p.id))));
export const PUT = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ClientController.update(req, p.id))));
export const DELETE = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ClientController.delete(req, p.id))));
