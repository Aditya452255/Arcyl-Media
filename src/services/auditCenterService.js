import prisma from "../config/db";

export class AuditCenterService {
  /**
   * Fetches paginated activity timeline records with filters
   */
  static async getTimeline({
    skip = 0,
    take = 20,
    userId,
    action,
    resource,
    startDate,
    endDate,
    search,
  }) {
    const where = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resource) where.resource = resource;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { resource: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return { total, data };
  }

  /**
   * Generates a string output representing CSV file format
   */
  static async exportCsv(filters) {
    const where = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const data = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const rows = data.map((log) => ({
      Timestamp: log.createdAt.toISOString(),
      RequestID: log.requestId || "N/A",
      User: log.user ? `${log.user.name} (${log.user.email})` : "System/Cron",
      Action: log.action,
      Resource: log.resource || "N/A",
      IPAddress: log.ipAddress || "N/A",
      UserAgent: log.userAgent || "N/A",
    }));

    const headers = [
      "Timestamp",
      "RequestID",
      "User",
      "Action",
      "Resource",
      "IPAddress",
      "UserAgent",
    ];

    const csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => `"${String(r[h]).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return csvContent;
  }
}
