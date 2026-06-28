import { OrganizationRepository } from "../repositories/organizationRepository";
import { AuditService } from "./auditService";

export class OrganizationService {
  static async getSettings() {
    let settings = await OrganizationRepository.get();
    if (!settings) {
      // Seed default organization settings block
      settings = await OrganizationRepository.create({
        companyName: "Arcyl Media",
        emails: ["operations@arcylmedia.com"],
        phone: "+1 (555) 019-2834",
        currency: "USD",
        timezone: "UTC",
        language: "en",
      });
    }
    return settings;
  }

  static async updateSettings(data, userId) {
    const existing = await this.getSettings();
    const updated = await OrganizationRepository.update(existing.id, data);

    await AuditService.log(
      "ORGANIZATION_UPDATE",
      { companyName: updated.companyName },
      userId,
      existing,
      updated,
      "Organization"
    );

    return updated;
  }
}
