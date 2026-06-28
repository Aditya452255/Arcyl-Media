import { TaskController } from "../../../../../controllers/taskController";
import { withErrorHandler } from "../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../middleware/authMiddleware";

export const GET = withErrorHandler(
  withPermission("Dashboard.Read", async (req, { params }) => {
    const { id } = await params;
    return await TaskController.getById(req, id);
  })
);

export const PUT = withErrorHandler(
  withPermission("Dashboard.Read", async (req, { params }) => {
    const { id } = await params;
    return await TaskController.update(req, id);
  })
);

export const DELETE = withErrorHandler(
  withPermission("Dashboard.Read", async (req, { params }) => {
    const { id } = await params;
    return await TaskController.delete(req, id);
  })
);
