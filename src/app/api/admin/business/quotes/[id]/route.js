import { BusinessController } from "../../../../../../controllers/businessController";
import { withAuth } from "../../../../../../middleware/authMiddleware";
import { withErrorHandler } from "../../../../../../middleware/errorHandler";

export const PUT = withErrorHandler(
  withAuth(async (req, { params }) => {
    const { id } = await params;
    return await BusinessController.updateQuote(req, id);
  })
);

export const DELETE = withErrorHandler(
  withAuth(async (req, { params }) => {
    const { id } = await params;
    return await BusinessController.deleteQuote(req, id);
  })
);
