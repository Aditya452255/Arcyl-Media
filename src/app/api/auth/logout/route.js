import { AuthController } from "../../../../controllers/authController";
import { withErrorHandler } from "../../../../middleware/errorHandler";

export const POST = withErrorHandler(async () => {
  return await AuthController.logout();
});
