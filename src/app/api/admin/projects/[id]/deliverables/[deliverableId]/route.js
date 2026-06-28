import { DeliverableController } from "../../../../../../../controllers/deliverableController";
import { withErrorHandler } from "../../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../../middleware/authMiddleware";

export const PUT = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => DeliverableController.update(req, p.id, p.deliverableId))));
export const DELETE = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => DeliverableController.delete(req, p.id, p.deliverableId))));
