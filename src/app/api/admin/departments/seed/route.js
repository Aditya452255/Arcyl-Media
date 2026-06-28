import { DepartmentController } from "../../../../../controllers/departmentController";
import { withErrorHandler } from "../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../middleware/authMiddleware";

export const POST = withErrorHandler(
  withPermission("User.Create", async (req) => {
    return await DepartmentController.seed(req);
  })
);
