# Arcyl Media Platform - Phase 1

This phase lays the structural and data foundations for the flagship project.

## Implementation Checklist
1. **Next.js & React Upgrade**: Migrate project to Next.js 15.x and React 19.x.
2. **PostgreSQL & Prisma Setup**: Configure schema containing `User`, `Lead`, `ContactSubmission`, and `ActivityLog` models.
3. **Configurations**: Set up Resend (email), Cloudinary (assets), and Pino (structured logger).
4. **Error & Response Uniformity**:
   * Create standardized API response formatter (`src/utils/apiResponse.js`).
   * Create Custom Error Classes (`src/utils/errors.js`).
   * Create Centralized Error Handler Middleware (`src/middleware/errorHandler.js`).
5. **Contact API Endpoint**:
   * Endpoint: `POST /api/contact`
   * Validator: `src/validators/contact.js` (Zod schema checking)
   * Repository: Database insertions for Leads, ContactSubmissions, and ActivityLogs.
   * Service: Save details, dispatch admin notification email, send visitor confirmation email.
   * Controller: Handle request parameters, invoke service, send response.
