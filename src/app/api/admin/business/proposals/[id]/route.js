import { BusinessController } from "../../../../../../controllers/businessController";
import { withAuth } from "../../../../../../middleware/authMiddleware";
import { withErrorHandler } from "../../../../../../middleware/errorHandler";

export const GET = withErrorHandler(
  withAuth(async (req, { params }) => {
    const { id } = await params;
    return await BusinessController.getProposal(req, id);
  })
);

export const PUT = withErrorHandler(
  withAuth(async (req, { params }) => {
    const { id } = await params;
    return await BusinessController.updateProposal(req, id);
  })
);

export const DELETE = withErrorHandler(
  withAuth(async (req, { params }) => {
    const { id } = await params;
    return await BusinessController.deleteProposal(req, id);
  })
);
