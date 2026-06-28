import { DeliverableController } from "../../../../../../controllers/deliverableController";
import { withErrorHandler } from "../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../middleware/authMiddleware";

export const GET = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => DeliverableController.list(req, p.id))));
export const POST = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => DeliverableController.create(req, p.id))));
