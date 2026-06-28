import pino from "pino";
import { env } from "../config/env";
import { requestContext } from "./context";

const logger = pino({
  level: env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "password",
      "token",
      "secret",
      "jwt",
      "passwordHash",
      "*.password",
      "*.token",
      "*.secret",
      "*.jwt",
      "*.passwordHash",
    ],
    censor: "[REDACTED]",
  },
  mixin() {
    const store = requestContext.getStore();
    if (store) {
      return {
        requestId: store.requestId,
        route: store.route,
        method: store.method,
        ip: store.ip,
        browser: store.browser,
        os: store.os,
        statusCode: store.statusCode,
        executionTime: store.executionTime !== undefined ? `${store.executionTime}ms` : undefined,
      };
    }
    return {};
  },
});

export default logger;
