import { ClientContactController } from "../../../../../../../controllers/clientContactController";
import { withErrorHandler } from "../../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../../middleware/authMiddleware";

export const PUT = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ClientContactController.update(req, p.id, p.contactId))));
export const DELETE = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ClientContactController.delete(req, p.id, p.contactId))));
