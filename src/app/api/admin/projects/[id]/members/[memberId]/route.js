import { ProjectMemberController } from "../../../../../../../controllers/projectMemberController";
import { withErrorHandler } from "../../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../../middleware/authMiddleware";

export const PUT = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ProjectMemberController.update(req, p.id, p.memberId))));
export const DELETE = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ProjectMemberController.remove(req, p.id, p.memberId))));
