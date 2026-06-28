import { TokenService } from "../services/tokenService";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import prisma from "../config/db";
import logger from "../utils/logger";

/**
 * Authentication & Tenant isolation guard for the Client Portal.
 * Rejects any user who does not have a linked clientId.
 */
export function withClientAuth(handler) {
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
      
      // Load user from DB to verify active clientId link
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, name: true, clientId: true },
      });

      if (!user || !user.clientId) {
        logger.warn({ userId: decoded.sub }, "Access Denied: User is not associated with a Client record");
        throw new ForbiddenError("Access Denied: Client portal access only.");
      }

      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        clientId: user.clientId,
      };
    } catch (err) {
      if (err instanceof ForbiddenError) throw err;
      logger.warn({ err }, "Client JWT verification failed");
      throw new UnauthorizedError("Session expired or invalid authentication token.");
    }

    return await handler(req, context);
  };
}
