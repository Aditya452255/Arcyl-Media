import { FeatureFlagService } from "../services/featureFlagService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const flagToggleSchema = z.object({
  key: z.string().min(1, "Feature key is required"),
  isEnabled: z.boolean(),
});

export class FeatureFlagController {
  static async list(req) {
    const list = await FeatureFlagService.listFlags();
    return ApiResponse.success("Feature flags retrieved successfully", list, 200);
  }

  static async toggle(req) {
    const body = await req.json();
    const parsed = flagToggleSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      throw new ValidationError("Validation failed", details);
    }

    const userId = req.user?.id;
    const flag = await FeatureFlagService.setFlag(
      parsed.data.key,
      parsed.data.isEnabled,
      userId
    );
    return ApiResponse.success("Feature flag updated successfully", flag, 200);
  }
}
