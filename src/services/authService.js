import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository";
import { PermissionRepository } from "../repositories/permissionRepository";
import { TokenService } from "./tokenService";
import { env } from "../config/env";
import resend from "../config/resend";
import logger from "../utils/logger";
import { ValidationError, UnauthorizedError, NotFoundError } from "../utils/errors";

export class AuthService {
  /**
   * Log in user
   */
  static async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const accessToken = TokenService.generateAccessToken(user);
    const refreshToken = TokenService.generateRefreshToken(user);
    const permissions = await PermissionRepository.findUserPermissions(user.id);

    logger.info({ userId: user.id }, "User successfully logged in");

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles.map((ur) => ur.role.name),
        permissions,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refreshes access token using a valid Refresh Token
   */
  static async refresh(token) {
    try {
      const decoded = TokenService.verifyRefreshToken(token);
      const user = await UserRepository.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedError("User session not found");
      }

      const accessToken = TokenService.generateAccessToken(user);
      const newRefreshToken = TokenService.generateRefreshToken(user);
      const permissions = await PermissionRepository.findUserPermissions(user.id);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles.map((ur) => ur.role.name),
          permissions,
        },
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedError("Session expired or invalid token");
    }
  }

  /**
   * Retrieve current user profile and permissions
   */
  static async me(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const permissions = await PermissionRepository.findUserPermissions(user.id);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles.map((ur) => ur.role.name),
      permissions,
    };
  }

  /**
   * Forgot password: Sends reset email link
   */
  static async forgotPassword(email, origin) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      // Return true to avoid user enumeration
      logger.warn({ email }, "Forgot password request on non-existing email");
      return true;
    }

    const resetToken = jwt.sign({ sub: user.id, type: "password_reset" }, env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `${origin || "http://localhost:3000"}/admin/reset-password?token=${resetToken}`;

    try {
      await resend.emails.send({
        from: env.EMAIL_FROM,
        to: user.email,
        subject: "Arcyl Media - Password Reset Request",
        html: `
          <div style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name || "User"},</p>
            <p>We received a request to reset your password. Click the button below to complete the setup. This link is valid for 1 hour.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #1a1a1a; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If the button doesn't work, copy and paste this link in your browser:</p>
            <p>${resetLink}</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The Arcyl Media Team</strong></p>
          </div>
        `,
      });
      logger.info({ userId: user.id }, "Password reset email dispatched successfully");
    } catch (err) {
      logger.error({ err, userId: user.id }, "Failed to send password reset email");
      throw new Error("Failed to send reset email");
    }

    return true;
  }

  /**
   * Reset password using a valid reset token
   */
  static async resetPassword(token, newPassword) {
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
      if (decoded.type !== "password_reset") {
        throw new ValidationError("Invalid token type");
      }
    } catch (err) {
      throw new ValidationError("Reset link is invalid or expired");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await UserRepository.update(decoded.sub, { passwordHash });
    logger.info({ userId: decoded.sub }, "Password successfully reset via token");

    return true;
  }

  /**
   * Change password directly
   */
  static async changePassword(userId, oldPassword, newPassword) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new ValidationError("Incorrect current password");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await UserRepository.update(userId, { passwordHash });
    logger.info({ userId }, "User password changed successfully");

    return true;
  }
}
