import { AuditCenterService } from "../services/auditCenterService";
import { ApiResponse } from "../utils/apiResponse";

export class AuditController {
  static async list(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const filters = {
      skip,
      take: limit,
      userId: searchParams.get("userId") || undefined,
      action: searchParams.get("action") || undefined,
      resource: searchParams.get("resource") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      search: searchParams.get("search") || "",
    };

    const result = await AuditCenterService.getTimeline(filters);

    const pages = Math.ceil(result.total / limit);

    return ApiResponse.success("Audit timeline retrieved successfully", result.data, 200, {
      total: result.total,
      page,
      limit,
      pages,
      hasNext: page < pages,
      hasPrevious: page > 1,
    });
  }

  static async export(req) {
    const { searchParams } = new URL(req.url);
    const filters = {
      userId: searchParams.get("userId") || undefined,
      action: searchParams.get("action") || undefined,
      resource: searchParams.get("resource") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    const csvContent = await AuditCenterService.exportCsv(filters);

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="audit_trail_export_${Date.now()}.csv"`,
      },
    });
  }
}
