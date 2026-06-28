import prisma from "../../../../config/db";
import { ApiResponse } from "../../../../utils/apiResponse";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withPermission } from "../../../../middleware/authMiddleware";

/**
 * GET /api/admin/activity-logs
 * Retrieves paginated audit logs trail (guarded by Dashboard.Read permission node)
 */
export const GET = withErrorHandler(
  withPermission("Dashboard.Read", async (req) => {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      prisma.activityLog.count(),
      prisma.activityLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    const pages = Math.ceil(total / limit);

    return ApiResponse.success("Activity logs retrieved successfully", data, 200, {
      total,
      page,
      limit,
      pages,
      hasNext: page < pages,
      hasPrevious: page > 1,
    });
  })
);
