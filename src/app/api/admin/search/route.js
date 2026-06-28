import { SearchController } from "../../../../controllers/searchController";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withPermission } from "../../../../middleware/authMiddleware";

export const GET = withErrorHandler(
  withPermission("Dashboard.Read", async (req) => {
    return await SearchController.search(req);
  })
);
