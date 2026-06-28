import { ContactController } from "../../../controllers/contactController";
import { withErrorHandler } from "../../../middleware/errorHandler";
import { RateLimiter } from "../../../lib/rateLimiter";
import { TooManyRequestsError } from "../../../utils/errors";

/**
 * POST /api/contact
 * Handles new public inquiries with rate limiting.
 */
export const POST = withErrorHandler(async (req) => {
  const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";

  // Rate Limiting: 5 requests / 10 minutes (600,000 ms)
  const isAllowed = RateLimiter.limit(`rate_contact_${ip}`, 5, 600000);
  if (!isAllowed) {
    throw new TooManyRequestsError(
      "Too many contact submissions. Please wait 10 minutes and try again."
    );
  }

  return await ContactController.submitContactForm(req);
});
