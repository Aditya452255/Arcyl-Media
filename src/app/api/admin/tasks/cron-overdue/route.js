import { TaskController } from "../../../../../controllers/taskController";
import { withErrorHandler } from "../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../middleware/authMiddleware";

export const POST = withErrorHandler(
  withPermission("Dashboard.Read", async (req) => {
    return await TaskController.triggerOverdueCheck(req);
  })
);

export const GET = POST;
