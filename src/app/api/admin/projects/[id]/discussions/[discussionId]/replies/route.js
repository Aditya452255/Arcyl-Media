import { DiscussionController } from "../../../../../../../../controllers/discussionController";
import { withErrorHandler } from "../../../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../../../middleware/authMiddleware";

export const GET = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => DiscussionController.listReplies(req, p.id, p.discussionId))));
export const POST = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => DiscussionController.addReply(req, p.id, p.discussionId))));

