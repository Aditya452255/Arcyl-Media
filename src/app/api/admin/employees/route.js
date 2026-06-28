import { EmployeeController } from "../../../../controllers/employeeController";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withPermission } from "../../../../middleware/authMiddleware";

export const GET = withErrorHandler(
  withPermission("Dashboard.Read", async (req) => {
    return await EmployeeController.getList(req);
  })
);

export const POST = withErrorHandler(
  withPermission("User.Create", async (req) => {
    return await EmployeeController.create(req);
  })
);
