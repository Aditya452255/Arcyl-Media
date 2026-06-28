import { ProjectService } from "./projectService";
import prisma from "../config/db";

export class ProjectDashboardService {
  static async getDashboard() {
    const stats = await ProjectService.getDashboard();

    // Recent activity on projects
    const recentActivity = await prisma.activityLog.findMany({
      where: { resource: "Project" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Team allocation — employees across active projects
    const teamAllocation = await prisma.projectMember.groupBy({
      by: ["employeeId"],
      where: { project: { status: "ACTIVE", isDeleted: false } },
      _count: { projectId: true },
    });

    // Budget overview
    const budgetData = await prisma.project.aggregate({
      where: { isDeleted: false },
      _sum: { budget: true },
      _avg: { progress: true },
    });

    return {
      summary: {
        activeProjects: stats.active,
        onHoldProjects: stats.onHold,
        completedProjects: stats.completed,
        delayedProjects: stats.delayed,
        totalBudget: budgetData._sum.budget || 0,
        averageProgress: Math.round(budgetData._avg.progress || 0),
      },
      upcomingDeadlines: stats.upcoming,
      teamAllocation: teamAllocation.map((t) => ({
        employeeId: t.employeeId,
        projectCount: t._count.projectId,
      })),
      recentActivity,
    };
  }
}
