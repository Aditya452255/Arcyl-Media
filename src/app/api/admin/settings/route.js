import prisma from "../../../../config/db";
import { ApiResponse } from "../../../../utils/apiResponse";
import { withErrorHandler } from "../../../../middleware/errorHandler";
import { withAuth, withPermission } from "../../../../middleware/authMiddleware";
import { AuditService } from "../../../../services/auditService";
import { cmsSchemas } from "../../../../validators/cms";
import { ValidationError } from "../../../../utils/errors";

/**
 * GET /api/admin/settings
 * Retrieves global website configurations (fallback seeds default if DB is empty)
 */
export const GET = withErrorHandler(
  withAuth(async () => {
    let settings = await prisma.siteSetting.findFirst();
    if (!settings) {
      settings = await prisma.siteSetting.create({
        data: {
          companyName: "Arcyl Media",
          email: "arcylmedia@gmail.com",
          businessHours: { default: "9:00 AM - 6:00 PM" },
          socialLinks: {},
          themeSettings: { primaryColor: "#1a1a1a" },
        },
      });
    }
    return ApiResponse.success("Website settings retrieved successfully", settings, 200);
  })
);

/**
 * PUT /api/admin/settings
 * Updates global website configurations (guarded by Settings.Update node)
 */
export const PUT = withErrorHandler(
  withPermission("Settings.Update", async (req) => {
    const body = await req.json();
    const parsed = cmsSchemas.siteSetting.safeParse(body);
    if (!parsed.success) {
      const details = (parsed.error.issues || []).map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      throw new ValidationError("Validation failed", details);
    }

    const settings = await prisma.siteSetting.findFirst();
    const userId = req.user?.id;

    let updated;
    if (!settings) {
      updated = await prisma.siteSetting.create({
        data: {
          ...parsed.data,
          updatedById: userId,
        },
      });
    } else {
      updated = await prisma.siteSetting.update({
        where: { id: settings.id },
        data: {
          ...parsed.data,
          updatedById: userId,
        },
      });
    }

    await AuditService.log("SETTINGS_UPDATE", { oldValue: settings, newValue: updated }, userId);
    return ApiResponse.success("Website settings updated successfully", updated, 200);
  })
);
