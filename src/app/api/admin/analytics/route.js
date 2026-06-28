import { DashboardService } from "../../../../services/dashboardService";
import { ApiResponse } from "../../../../utils/apiResponse";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withPermission } from "../../../../middleware/authMiddleware";

/**
 * GET /api/admin/analytics
 * Retrieves growth percentages and custom agency analytics stats.
 */
export const GET = withErrorHandler(
  withPermission("Dashboard.Read", async () => {
    const data = await DashboardService.getAnalytics();
    return ApiResponse.success("Analytics data retrieved successfully", data, 200);
  })
);
