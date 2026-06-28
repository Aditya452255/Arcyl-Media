import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const logger = pino({
  level: process.env.PINO_LOG_LEVEL || "info",
});

export default logger;
