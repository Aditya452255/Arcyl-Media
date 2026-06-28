import { ClientController } from "../../../../../../controllers/clientController";
import { withErrorHandler } from "../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../middleware/authMiddleware";

export const POST = withErrorHandler(withPermission("Dashboard.Read", (req, { params }) => params.then(p => ClientController.archive(req, p.id))));
