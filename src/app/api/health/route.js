import prisma from "../../../config/db";
import { env } from "../../../config/env";
import { ApiResponse } from "../../../utils/apiResponse";
import { withErrorHandler } from "../../../middleware/errorHandler";
import packageJson from "../../../../package.json";

/**
 * GET /api/health
 * Evaluates core system components and configuration statuses.
 */
export const GET = withErrorHandler(async () => {
  let databaseStatus = "disconnected";
  try {
    // Execute simple lightweight query to confirm connection
    await prisma.$queryRaw`SELECT 1`;
    databaseStatus = "connected";
  } catch (error) {
    // Catch database errors to let health check return indicating failure rather than a 500
  }

  const emailStatus =
    env.RESEND_API_KEY && !env.RESEND_API_KEY.includes("your_resend_api_key")
      ? "configured"
      : "unconfigured";

  const cloudinaryStatus =
    env.CLOUDINARY_CLOUD_NAME && !env.CLOUDINARY_CLOUD_NAME.includes("your_cloudinary")
      ? "configured"
      : "unconfigured";

  const healthData = {
    services: {
      database: databaseStatus,
      email: emailStatus,
      cloudinary: cloudinaryStatus,
    },
    version: packageJson.version || "1.0.0",
    uptime: process.uptime(),
  };

  return ApiResponse.success("System status check successful", healthData, 200);
});
