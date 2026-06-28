import { OrganizationService } from "../services/organizationService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const organizationSchema = z.object({
  companyName: z.string().min(1, "Company Name is required"),
  logo: z.string().optional().nullable(),
  favicon: z.string().optional().nullable(),
  gst: z.string().optional().nullable(),
  pan: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  emails: z.array(z.string().email("Invalid email format")).optional().nullable(),
  address: z.string().optional().nullable(),
  currency: z.string().min(1).default("USD"),
  timezone: z.string().min(1).default("UTC"),
  language: z.string().min(1).default("en"),
  businessHours: z.any().optional().nullable(),
  socialLinks: z.any().optional().nullable(),
});

export class OrganizationController {
  static async get(req) {
    const settings = await OrganizationService.getSettings();
    return ApiResponse.success("Organization settings retrieved successfully", settings, 200);
  }

  static async update(req) {
    const body = await req.json();
    const parsed = organizationSchema.partial().safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      throw new ValidationError("Validation failed", details);
    }

    const userId = req.user?.id;
    const settings = await OrganizationService.updateSettings(parsed.data, userId);
    return ApiResponse.success("Organization settings updated successfully", settings, 200);
  }
}
