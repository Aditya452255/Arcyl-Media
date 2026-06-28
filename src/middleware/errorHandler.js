import logger from "../utils/logger";
import { ApiResponse } from "../utils/apiResponse";
import { AppError } from "../utils/errors";
import { ZodError } from "zod";

/**
 * Higher-order function to wrap Next.js App Router API Route handlers
 * with centralized error handling and logging.
 */
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      // Log the full error stack with Pino
      logger.error({ err: error }, error.message || "Unhandled error occurred in API Route");

      // AppError handling (our custom thrown errors)
      if (error instanceof AppError) {
        return ApiResponse.error(
          error.message,
          error.errorCode,
          error.details,
          error.statusCode
        );
      }

      // Zod validation errors
      if (error instanceof ZodError) {
        const issues = error.issues || error.errors || [];
        const details = issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return ApiResponse.error("Validation failed", "VALIDATION_ERROR", details, 400);
      }

      // Prisma database errors (e.g. unique constraint violation, connection issues)
      if (error.code && error.code.startsWith("P")) {
        // e.g. P2002: Unique constraint failed
        if (error.code === "P2002") {
          return ApiResponse.error(
            "Conflict: A resource with these details already exists.",
            "CONFLICT_ERROR",
            null,
            409
          );
        }
        return ApiResponse.error(
          "Database transaction error",
          "DATABASE_ERROR",
          process.env.NODE_ENV !== "production" ? error.message : null,
          500
        );
      }

      // Catch-all Internal Server Error
      const isDev = process.env.NODE_ENV !== "production";
      return ApiResponse.error(
        isDev ? error.message : "An unexpected error occurred",
        "INTERNAL_SERVER_ERROR",
        isDev ? error.stack : null,
        500
      );
    }
  };
}
