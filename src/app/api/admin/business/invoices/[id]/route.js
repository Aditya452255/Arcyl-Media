import { BusinessController } from "../../../../../../controllers/businessController";
import { withAuth } from "../../../../../../middleware/authMiddleware";
import { withErrorHandler } from "../../../../../../middleware/errorHandler";

export const GET = withErrorHandler(
  withAuth(async (req, { params }) => {
    const { id } = await params;
    return await BusinessController.getInvoice(req, id);
  })
);

export const PUT = withErrorHandler(
  withAuth(async (req, { params }) => {
    const { id } = await params;
    return await BusinessController.updateInvoice(req, id);
  })
);

export const DELETE = withErrorHandler(
  withAuth(async (req, { params }) => {
    const { id } = await params;
    return await BusinessController.deleteInvoice(req, id);
  })
);
