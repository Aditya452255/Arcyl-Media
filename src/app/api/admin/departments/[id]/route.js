import { DepartmentController } from "../../../../../controllers/departmentController";
import { withErrorHandler } from "../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../middleware/authMiddleware";

export const GET = withErrorHandler(
  withPermission("Dashboard.Read", async (req, { params }) => {
    const { id } = await params;
    return await DepartmentController.getById(req, id);
  })
);

export const PUT = withErrorHandler(
  withPermission("User.Update", async (req, { params }) => {
    const { id } = await params;
    return await DepartmentController.update(req, id);
  })
);

export const DELETE = withErrorHandler(
  withPermission("User.Delete", async (req, { params }) => {
    const { id } = await params;
    return await DepartmentController.delete(req, id);
  })
);
