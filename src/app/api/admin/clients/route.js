import { ClientController } from "../../../../controllers/clientController";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withPermission } from "../../../../middleware/authMiddleware";

export const GET = withErrorHandler(withPermission("Dashboard.Read", (req) => ClientController.getList(req)));
export const POST = withErrorHandler(withPermission("Dashboard.Read", (req) => ClientController.create(req)));
