import { AuthService } from "../services/authService";
import { ApiResponse } from "../utils/apiResponse";
import { env } from "../config/env";

export class AuthController {
  /**
   * Generates secure HTTP-only cookie headers options
   */
  static getCookieOptions(expiryMs) {
    return [
      `HttpOnly`,
      `Path=/`,
      `SameSite=Lax`,
      `Max-Age=${Math.floor(expiryMs / 1000)}`,
      env.NODE_ENV === "production" ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");
  }

  /**
   * POST /api/auth/login
   */
  static async login(req) {
    const { email, password } = await req.json();
    const result = await AuthService.login(email, password);

    const response = ApiResponse.success("Login successful", result.user, 200);

    const accessCookie = `accessToken=${result.accessToken}; ${this.getCookieOptions(15 * 60 * 1000)}`;
    const refreshCookie = `refreshToken=${result.refreshToken}; ${this.getCookieOptions(7 * 24 * 60 * 60 * 1000)}`;

    response.headers.append("Set-Cookie", accessCookie);
    response.headers.append("Set-Cookie", refreshCookie);

    return response;
  }

  /**
   * POST /api/auth/logout
   */
  static async logout() {
    const response = ApiResponse.success("Logged out successfully", null, 200);

    // Expire cookies instantly
    const accessCookie = `accessToken=; Path=/; SameSite=Lax; Max-Age=0; HttpOnly; ${
      env.NODE_ENV === "production" ? "Secure" : ""
    }`;
    const refreshCookie = `refreshToken=; Path=/; SameSite=Lax; Max-Age=0; HttpOnly; ${
      env.NODE_ENV === "production" ? "Secure" : ""
    }`;

    response.headers.append("Set-Cookie", accessCookie);
    response.headers.append("Set-Cookie", refreshCookie);

    return response;
  }

  /**
   * POST /api/auth/refresh
   */
  static async refresh(req) {
    const cookies = req.headers.get("cookie") || "";
    const refreshToken = cookies
      .split(";")
      .find((c) => c.trim().startsWith("refreshToken="))
      ?.split("=")[1];

    if (!refreshToken) {
      return ApiResponse.error("Session expired, please login again", "UNAUTHORIZED_ERROR", null, 401);
    }

    const result = await AuthService.refresh(refreshToken);
    const response = ApiResponse.success("Session refreshed successfully", result.user, 200);

    const accessCookie = `accessToken=${result.accessToken}; ${this.getCookieOptions(15 * 60 * 1000)}`;
    const refreshCookie = `refreshToken=${result.refreshToken}; ${this.getCookieOptions(7 * 24 * 60 * 60 * 1000)}`;

    response.headers.append("Set-Cookie", accessCookie);
    response.headers.append("Set-Cookie", refreshCookie);

    return response;
  }

  /**
   * GET /api/auth/me
   */
  static async me(req) {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponse.error("Unauthorized session", "UNAUTHORIZED_ERROR", null, 401);
    }

    const profile = await AuthService.me(userId);
    return ApiResponse.success("User profile retrieved successfully", profile, 200);
  }

  /**
   * POST /api/auth/forgot-password
   */
  static async forgotPassword(req) {
    const { email } = await req.json();
    const origin = new URL(req.url).origin;

    await AuthService.forgotPassword(email, origin);
    return ApiResponse.success("If the account exists, a reset link has been sent.", null, 200);
  }

  /**
   * POST /api/auth/reset-password
   */
  static async resetPassword(req) {
    const { token, newPassword } = await req.json();

    await AuthService.resetPassword(token, newPassword);
    return ApiResponse.success("Password reset successfully.", null, 200);
  }

  /**
   * POST /api/auth/change-password
   */
  static async changePassword(req) {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponse.error("Unauthorized session", "UNAUTHORIZED_ERROR", null, 401);
    }

    const { oldPassword, newPassword } = await req.json();
    await AuthService.changePassword(userId, oldPassword, newPassword);
    return ApiResponse.success("Password changed successfully.", null, 200);
  }
}
