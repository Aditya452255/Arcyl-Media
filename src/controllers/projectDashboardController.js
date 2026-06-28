import { ProjectDashboardService } from "../services/projectDashboardService";
import { ApiResponse } from "../utils/apiResponse";

export class ProjectDashboardController {
  static async get(req) {
    return ApiResponse.success("Project dashboard retrieved", await ProjectDashboardService.getDashboard(), 200);
  }
}
