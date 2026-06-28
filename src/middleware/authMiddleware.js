import { TokenService } from "../services/tokenService";
import { PermissionRepository } from "../repositories/permissionRepository";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import logger from "../utils/logger";

/**
 * Authentication decorator for Next.js API Routes.
 * Parses and verifies access token inside cookies, propagating req.user context.
 */
export function withAuth(handler) {
  return async (req, context) => {
    const cookies = req.headers.get("cookie") || "";
    const accessToken = cookies
      .split(";")
      .find((c) => c.trim().startsWith("accessToken="))
      ?.split("=")[1];

    if (!accessToken) {
      throw new UnauthorizedError("Authentication required. Please login.");
    }

    try {
      const decoded = TokenService.verifyAccessToken(accessToken);
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
      };
      
      // Inject authenticated context into the global request store
      const store = requestContext.getStore();
      if (store) {
        store.userId = decoded.sub;
      }
    } catch (err) {
      logger.warn({ err }, "JWT authentication token verification failed");
      throw new UnauthorizedError("Session expired or invalid authentication token.");
    }

    return await handler(req, context);
  };
}

/**
 * Dynamic Permission guard decorator.
 * Ensures the authenticated user holds the required resource permission Node.
 */
export function withPermission(permissionNode, handler) {
  return withAuth(async (req, context) => {
    const permissions = await PermissionRepository.findUserPermissions(req.user.id);
    if (!permissions.includes(permissionNode)) {
      logger.warn(
        { userId: req.user.id, permissionNode },
        "Access denied: insufficient permission node"
      );
      throw new ForbiddenError("Access Denied: You do not have the required permissions.");
    }
    return await handler(req, context);
  });
}
