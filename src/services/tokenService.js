import jwt from "jsonwebtoken";
import { env } from "../config/env";

export class TokenService {
  /**
   * Generates JWT Access Token (15-minute expiry)
   */
  static generateAccessToken(user) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });
  }

  /**
   * Generates JWT Refresh Token (7-day expiry)
   */
  static generateRefreshToken(user) {
    const payload = { sub: user.id };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
  }

  /**
   * Verifies Access Token
   */
  static verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_SECRET);
  }

  /**
   * Verifies Refresh Token
   */
  static verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  }
}
