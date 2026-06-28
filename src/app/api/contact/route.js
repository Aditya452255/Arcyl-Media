import { ContactController } from "../../../controllers/contactController";
import { withErrorHandler } from "../../../middleware/errorHandler";

/**
 * POST /api/contact
 * Handles new public inquiries.
 */
export const POST = withErrorHandler(async (req) => {
  return await ContactController.submitContactForm(req);
});
