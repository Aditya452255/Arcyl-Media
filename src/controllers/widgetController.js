import { WidgetService } from "../services/widgetService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const widgetSaveSchema = z.object({
  widgetKey: z.string().min(1, "Widget key is required"),
  isVisible: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
  preferences: z.any().optional(),
});

export class WidgetController {
  static async list(req) {
    const userId = req.user.id;
    const list = await WidgetService.getWidgets(userId);
    return ApiResponse.success("Widgets retrieved successfully", list, 200);
  }

  static async save(req) {
    const body = await req.json();
    const parsed = widgetSaveSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      throw new ValidationError("Validation failed", details);
    }

    const userId = req.user.id;
    const widget = await WidgetService.saveWidget(userId, parsed.data.widgetKey, parsed.data);
    return ApiResponse.success("Widget setting saved successfully", widget, 200);
  }
}
