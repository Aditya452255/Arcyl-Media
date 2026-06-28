import { ProjectFileController } from "../../../../../../controllers/projectFileController";
import { withErrorHandler } from "../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../middleware/authMiddleware";

export const GET = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ProjectFileController.list(req, p.id))));
export const POST = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ProjectFileController.upload(req, p.id))));
