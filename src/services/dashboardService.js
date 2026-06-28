import prisma from "../config/db";
import { LEAD_STATUS } from "../constants/status";

export class DashboardService {
  /**
   * Aggregates stats and histories for admin console summary in a single query
   */
  static async getSummary(userId = null) {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      totalLeads,
      newLeads,
      totalProjects,
      activeProjects,
      contactMessagesCount,
      recentActivity,
      recentLeads,
      recentContactSubmissions,
      myTasksCount,
      dueTodayCount,
      overdueCount,
      completedThisWeekCount,
      recentTaskActivity,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: LEAD_STATUS.NEW } }),
      prisma.portfolio.count({ where: { isDeleted: false } }),
      prisma.portfolio.count({ where: { isPublished: true, isDeleted: false } }),
      prisma.contactSubmission.count(),
      prisma.activityLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.contactSubmission.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          lead: true,
        },
      }),
      userId
        ? prisma.task.count({ where: { assigneeId: userId, isDeleted: false, status: { not: "DONE" } } })
        : Promise.resolve(0),
      prisma.task.count({
        where: { isDeleted: false, status: { not: "DONE" }, dueDate: { gte: startOfToday, lte: endOfToday } },
      }),
      prisma.task.count({
        where: { isDeleted: false, status: { not: "DONE" }, dueDate: { lt: startOfToday } },
      }),
      prisma.task.count({
        where: { isDeleted: false, status: "DONE", completedAt: { gte: startOfWeek } },
      }),
      prisma.activityLog.findMany({
        where: { resource: "Task" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } },
      }),
    ]);

    return {
      summary: {
        totalLeads,
        newLeads,
        totalProjects,
        activeProjects,
        totalClients: 12, // Placeholder
        contactMessages: contactMessagesCount,
        websiteViews: 14580, // Placeholder
        revenue: 85400, // Placeholder
      },
      taskWidgets: {
        myTasksCount,
        dueTodayCount,
        overdueCount,
        completedThisWeekCount,
        recentTaskActivity,
      },
      recentActivity,
      recentLeads,
      recentContactSubmissions,
    };
  }

  /**
   * Aggregates stats for growth comparison and analytics charts
   */
  static async getAnalytics() {
    const totalLeads = await prisma.lead.count();
    const leadsThisMonth = await prisma.lead.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const leadsLastMonth = await prisma.lead.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    // Calculate growth percentage
    let growthPercentage = 0;
    if (leadsLastMonth > 0) {
      growthPercentage = ((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100;
    } else if (leadsThisMonth > 0) {
      growthPercentage = 100;
    }

    return {
      overview: {
        totalVisitors: 28540, // Placeholder
        ctaClicks: 840, // Placeholder
        contactFormSubmissions: await prisma.contactSubmission.count(),
        topService: "AI Automation Consulting", // Placeholder
        topPortfolioProject: "Arcyl Media Redesign", // Placeholder
        mostVisitedPage: "/services", // Placeholder
        leadsThisMonth,
        leadsLastMonth,
        growthPercentage: Number(growthPercentage.toFixed(2)),
      },
    };
  }
}
