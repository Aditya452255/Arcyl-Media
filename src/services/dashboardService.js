import prisma from "../config/db";
import { LEAD_STATUS } from "../constants/status";

export class DashboardService {
  /**
   * Aggregates stats and histories for admin console summary in a single query
   */
  static async getSummary() {
    const [
      totalLeads,
      newLeads,
      totalProjects,
      activeProjects,
      contactMessagesCount,
      recentActivity,
      recentLeads,
      recentContactSubmissions,
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
