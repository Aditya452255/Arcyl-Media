import { MilestoneController } from "../../../../../../../controllers/milestoneController";
import { withErrorHandler } from "../../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../../middleware/authMiddleware";

export const PUT = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => MilestoneController.update(req, p.id, p.milestoneId))));
export const DELETE = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => MilestoneController.delete(req, p.id, p.milestoneId))));
