import { BusinessController } from "../../../../../controllers/businessController";
import { withAuth } from "../../../../../middleware/authMiddleware";
import { withErrorHandler } from "../../../../../middleware/errorHandler";

export const GET = withErrorHandler(
  withAuth(async (req) => {
    return await BusinessController.getStats(req);
  })
);
