import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string({ required_error: "DATABASE_URL is required" }).url("DATABASE_URL must be a valid URL"),
  JWT_SECRET: z.string({ required_error: "JWT_SECRET is required" }).min(8, "JWT_SECRET must be at least 8 characters"),
  JWT_REFRESH_SECRET: z.string({ required_error: "JWT_REFRESH_SECRET is required" }).min(8, "JWT_REFRESH_SECRET must be at least 8 characters"),
  RESEND_API_KEY: z.string({ required_error: "RESEND_API_KEY is required" }).min(1, "RESEND_API_KEY is required"),
  EMAIL_FROM: z.string({ required_error: "EMAIL_FROM is required" }).min(1, "EMAIL_FROM is required"),
  ADMIN_EMAIL: z.string({ required_error: "ADMIN_EMAIL is required" }).email("ADMIN_EMAIL must be a valid email format"),
  CLOUDINARY_CLOUD_NAME: z.string({ required_error: "CLOUDINARY_CLOUD_NAME is required" }).min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string({ required_error: "CLOUDINARY_API_KEY is required" }).min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string({ required_error: "CLOUDINARY_API_SECRET is required" }).min(1, "CLOUDINARY_API_SECRET is required"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

let parsedEnv;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  console.error("❌ Environment validation failed during application startup:");
  if (error instanceof z.ZodError) {
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join(".")}: ${err.message}`);
    });
  } else {
    console.error(error);
  }
  throw new Error("Application startup aborted due to configuration errors.");
}

export const env = Object.freeze(parsedEnv);
