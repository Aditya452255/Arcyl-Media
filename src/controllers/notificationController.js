import { NotificationService } from "../services/notificationService";
import { ApiResponse } from "../utils/apiResponse";

export class NotificationController {
  static async list(req) {
    const userId = req.user.id;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const isReadParam = searchParams.get("isRead");
    const isRead =
      isReadParam === "true" ? true : isReadParam === "false" ? false : undefined;

    const result = await NotificationService.getNotificationsForUser(userId, {
      skip,
      take: limit,
      isRead,
    });

    return ApiResponse.success("Notifications retrieved successfully", result.data, 200, result.pagination);
  }

  static async markRead(req, id) {
    const userId = req.user.id;
    await NotificationService.markAsRead(id, userId);
    return ApiResponse.success("Notification marked as read", null, 200);
  }

  static async markAllRead(req) {
    const userId = req.user.id;
    await NotificationService.markAllAsRead(userId);
    return ApiResponse.success("All notifications marked as read", null, 200);
  }

  static async archive(req, id) {
    const userId = req.user.id;
    await NotificationService.archive(id, userId);
    return ApiResponse.success("Notification archived", null, 200);
  }
}
