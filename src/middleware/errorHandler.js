import crypto from "crypto";
import logger from "../utils/logger";
import { ApiResponse } from "../utils/apiResponse";
import { AppError } from "../utils/errors";
import { ZodError } from "zod";
import { requestContext } from "../utils/context";

/**
 * Simple User-Agent parser to avoid third party dependency overhead
 */
function parseUserAgent(ua) {
  if (!ua) return { browser: "Unknown", os: "Unknown" };

  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Macintosh") || ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Chrome") && !ua.includes("Chromium") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome") && !ua.includes("Chromium")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("MSIE") || ua.includes("Trident")) browser = "Internet Explorer";

  return { browser, os };
}

/**
 * Global API Router wrapper providing Request ID propagation, structured context logging,
 * rate limiting hooks, and database/internal exception masking.
 */
export function withErrorHandler(handler) {
  return async (request, context) => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    const ip = request.headers.get("x-forwarded-for") || request.ip || "127.0.0.1";
    const ua = request.headers.get("user-agent") || "";
    const { browser, os } = parseUserAgent(ua);
    const route = new URL(request.url).pathname;
    const method = request.method;

    // Build Thread-Local storage store
    const store = {
      requestId,
      startTime,
      ip,
      browser,
      os,
      userAgent: ua,
      route,
      method,
      statusCode: 200,
      executionTime: 0,
    };

    return await requestContext.run(store, async () => {
      try {
        const response = await handler(request, context);

        store.statusCode = response.status;
        store.executionTime = Date.now() - startTime;

        // Structured logging of successful requests
        logger.info(
          `Request completed: ${method} ${route} -> status ${response.status} (${store.executionTime}ms)`
        );

        return response;
      } catch (error) {
        store.executionTime = Date.now() - startTime;
        let responsePayload;

        if (error instanceof AppError) {
          store.statusCode = error.statusCode;
          responsePayload = ApiResponse.error(
            error.message,
            error.errorCode,
            error.details,
            error.statusCode
          );
        } else if (error instanceof ZodError) {
          store.statusCode = 400;
          const issues = error.issues || error.errors || [];
          const details = issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));
          responsePayload = ApiResponse.error("Validation failed", "VALIDATION_ERROR", details, 400);
        } else {
          // Task 4: Mask Prisma/database/SQL errors and hide internal exception messages
          store.statusCode = 500;

          // Log detailed error information via Pino for developer access
          logger.error({ err: error }, error.message || "Unhandled server exception");

          responsePayload = ApiResponse.error(
            "Internal Server Error",
            "INTERNAL_SERVER_ERROR",
            null, // Hides all stack traces and database internal parameters
            500
          );
        }

        logger.info(
          `Request failed: ${method} ${route} -> status ${store.statusCode} (${store.executionTime}ms)`
        );

        return responsePayload;
      }
    });
  };
}
