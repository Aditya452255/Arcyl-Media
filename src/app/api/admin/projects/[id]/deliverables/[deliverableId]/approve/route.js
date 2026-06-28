import { DeliverableController } from "../../../../../../../../controllers/deliverableController";
import { withErrorHandler } from "../../../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../../../middleware/authMiddleware";

export const POST = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => DeliverableController.approve(req, p.id, p.deliverableId))));
