import { ActivityLogRepository } from "../repositories/activityLogRepository";
import { requestContext } from "../utils/context";
import logger from "../utils/logger";

export class AuditService {
  /**
   * Log administrative mutations, security actions, and CMS edits.
   * Pulls Request ID, IP, and User-Agent from context automatically.
   */
  static async log(action, details = {}, userId = null) {
    try {
      const store = requestContext.getStore();
      const finalUserId = userId || store?.userId || null;

      await ActivityLogRepository.create({
        userId: finalUserId,
        action,
        details: {
          ...details,
          requestId: store?.requestId || null,
        },
        ipAddress: store?.ip || null,
        userAgent: store?.userAgent || null,
      });

      logger.info({ action, userId: finalUserId }, `Audit log recorded: ${action}`);
    } catch (err) {
      logger.error({ err }, "Failed to record audit log");
    }
  }
}
