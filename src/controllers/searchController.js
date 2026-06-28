import { SearchService } from "../services/searchService";
import { ApiResponse } from "../utils/apiResponse";

export class SearchController {
  /**
   * Performs the global cross-database query search
   */
  static async search(req) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const result = await SearchService.searchAll(query);
    return ApiResponse.success("Global search executed successfully", result, 200);
  }
}
