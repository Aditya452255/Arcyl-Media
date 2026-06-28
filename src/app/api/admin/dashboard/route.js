import { DashboardService } from "../../../../services/dashboardService";
import { ApiResponse } from "../../../../utils/apiResponse";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withPermission } from "../../../../middleware/authMiddleware";

/**
 * GET /api/admin/dashboard
 * Retreives aggregated statistics and recent history logs for the admin console.
 */
export const GET = withErrorHandler(
  withPermission("Dashboard.Read", async () => {
    const data = await DashboardService.getSummary();
    return ApiResponse.success("Dashboard summary retrieved successfully", data, 200);
  })
);
