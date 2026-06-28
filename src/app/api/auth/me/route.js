import { AuthController } from "../../../../controllers/authController";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withAuth } from "../../../../middleware/authMiddleware";

export const GET = withErrorHandler(
  withAuth(async (req) => {
    return await AuthController.me(req);
  })
);
