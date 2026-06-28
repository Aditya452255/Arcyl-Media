import { TaskController } from "../../../../../../../controllers/taskController";
import { withErrorHandler } from "../../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../../middleware/authMiddleware";

export const DELETE = withErrorHandler(
  withPermission("Dashboard.Read", async (req, { params }) => {
    const { id, attachmentId } = await params;
    return await TaskController.deleteAttachment(req, id, attachmentId);
  })
);
