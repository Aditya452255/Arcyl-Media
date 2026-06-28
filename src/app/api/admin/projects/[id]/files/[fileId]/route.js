import { ProjectFileController } from "../../../../../../../controllers/projectFileController";
import { withErrorHandler } from "../../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../../middleware/authMiddleware";

export const DELETE = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ProjectFileController.delete(req, p.id, p.fileId))));
