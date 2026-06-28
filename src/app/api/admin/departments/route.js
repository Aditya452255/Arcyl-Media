import { DepartmentController } from "../../../../controllers/departmentController";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withPermission } from "../../../../middleware/authMiddleware";

export const GET = withErrorHandler(
  withPermission("Dashboard.Read", async (req) => {
    return await DepartmentController.getList(req);
  })
);

export const POST = withErrorHandler(
  withPermission("User.Create", async (req) => {
    return await DepartmentController.create(req);
  })
);
