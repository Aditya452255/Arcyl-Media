import { BusinessController } from "../../../../../../../controllers/businessController";
import { withAuth } from "../../../../../../../middleware/authMiddleware";
import { withErrorHandler } from "../../../../../../../middleware/errorHandler";

export const POST = withErrorHandler(
  withAuth(async (req, { params }) => {
    const { id } = await params;
    return await BusinessController.duplicateProposal(req, id);
  })
);
