import { TaskController } from "../../../../../../controllers/taskController";
import { withErrorHandler } from "../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../middleware/authMiddleware";

export const GET = withErrorHandler(
  withPermission("Dashboard.Read", async (req, { params }) => {
    const { id } = await params;
    return await TaskController.getAttachments(req, id);
  })
);

export const POST = withErrorHandler(
  withPermission("Dashboard.Read", async (req, { params }) => {
    const { id } = await params;
    return await TaskController.uploadAttachment(req, id);
  })
);
