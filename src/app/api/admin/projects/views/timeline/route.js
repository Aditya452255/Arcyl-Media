import { ProjectRepository } from "../../../../../../repositories/projectRepository";
import { ApiResponse } from "../../../../../../utils/apiResponse";
import { withErrorHandler } from "../../../../../../middleware/errorHandler";
import { withPermission } from "../../../../../../middleware/authMiddleware";

async function handler(req) {
  // Timeline: return all active projects sorted by startDate/deadline
  const projects = await ProjectRepository.findMany({
    skip: 0, take: 100,
    status: "ACTIVE",
    sortBy: "startDate", sortOrder: "asc",
  });
  const timeline = projects.map((p) => ({
    id: p.id, name: p.name, status: p.status, priority: p.priority,
    startDate: p.startDate, deadline: p.deadline, progress: p.progress,
    client: p.client, manager: p.manager,
  }));
  return ApiResponse.success("Timeline view retrieved", timeline, 200);
}

export const GET = withErrorHandler(withPermission("Dashboard.Read", handler));
