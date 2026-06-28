import { SystemSettingService } from "../services/systemSettingService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const settingSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
  category: z.string().min(1, "Category is required"),
});

export class SystemSettingController {
  static async set(req) {
    const body = await req.json();
    const parsed = settingSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      throw new ValidationError("Validation failed", details);
    }

    const userId = req.user?.id;
    const setting = await SystemSettingService.setSetting(
      parsed.data.key,
      parsed.data.value,
      parsed.data.category,
      userId
    );
    return ApiResponse.success("System setting updated successfully", setting, 200);
  }

  static async getByKey(req, key) {
    const setting = await SystemSettingService.getSetting(key);
    if (!setting) {
      return ApiResponse.error("Setting key not found", 404, "NOT_FOUND");
    }
    return ApiResponse.success("System setting retrieved successfully", setting, 200);
  }

  static async list(req) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const list = await SystemSettingService.listSettings(category);
    return ApiResponse.success("System settings retrieved successfully", list, 200);
  }

  static async delete(req, key) {
    const userId = req.user?.id;
    await SystemSettingService.deleteSetting(key, userId);
    return ApiResponse.success("System setting deleted successfully", null, 200);
  }
}
