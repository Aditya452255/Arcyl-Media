import { BusinessController } from "../../../../../../controllers/businessController";
import { withAuth } from "../../../../../../middleware/authMiddleware";
import { withErrorHandler } from "../../../../../../middleware/errorHandler";

export const GET = withErrorHandler(
  withAuth(async (req, { params }) => {
    const { id } = await params;
    return await BusinessController.getClientTimeline(req, id);
  })
);
