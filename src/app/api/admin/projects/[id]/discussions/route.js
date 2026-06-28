import { DiscussionController } from "../../../../../../controllers/discussionController";
import { withErrorHandler } from "../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../middleware/authMiddleware";

export const GET = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => DiscussionController.list(req, p.id))));
export const POST = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => DiscussionController.create(req, p.id))));
