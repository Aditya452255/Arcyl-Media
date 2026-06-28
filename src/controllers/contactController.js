import { contactSchema } from "../validators/contact";
import { ContactService } from "../services/contactService";
import { ApiResponse } from "../utils/apiResponse";

export class ContactController {
  /**
   * Controller adapter for public contact form submission
   */
  static async submitContactForm(req) {
    const body = await req.json();

    // 1. Validate incoming JSON payload with Zod schema (throws ZodError on failure)
    const validatedData = contactSchema.parse(body);

    // Extract client network details
    const ipAddress = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    // 2. Invoke service containing business flows
    const submission = await ContactService.handleContactSubmission(
      validatedData,
      ipAddress,
      userAgent
    );

    // 3. Return formatted API response
    return ApiResponse.success(
      "Contact submission recorded successfully",
      {
        id: submission.id,
        leadId: submission.leadId,
        subject: submission.subject,
      },
      201
    );
  }
}
