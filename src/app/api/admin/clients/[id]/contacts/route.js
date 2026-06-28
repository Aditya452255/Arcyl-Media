import { ClientContactController } from "../../../../../../controllers/clientContactController";
import { withErrorHandler } from "../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../middleware/authMiddleware";

export const GET = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ClientContactController.list(req, p.id))));
export const POST = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ClientContactController.create(req, p.id))));
