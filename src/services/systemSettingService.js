import { SystemSettingRepository } from "../repositories/systemSettingRepository";
import { encrypt, decrypt } from "../utils/crypto";
import { AuditService } from "./auditService";
import { NotFoundError } from "../utils/errors";

const sensitiveKeys = [
  "SMTP_PASSWORD",
  "CLOUDINARY_API_SECRET",
  "GOOGLE_API_KEY",
  "FACEBOOK_APP_SECRET",
  "LINKEDIN_CLIENT_SECRET",
];

export class SystemSettingService {
  /**
   * Retrieves a setting key, decrypting it if necessary
   */
  static async getSetting(key) {
    const setting = await SystemSettingRepository.findByKey(key);
    if (!setting) return null;

    if (setting.isEncrypted) {
      setting.value = decrypt(setting.value);
    }
    return setting;
  }

  /**
   * Saves or updates a setting key, encrypting it if sensitive
   */
  static async setSetting(key, value, category, userId) {
    const shouldEncrypt = sensitiveKeys.includes(key);
    const storedValue = shouldEncrypt ? encrypt(value) : value;

    const existing = await SystemSettingRepository.findByKey(key);
    let setting;

    if (existing) {
      setting = await SystemSettingRepository.update(key, {
        value: storedValue,
        isEncrypted: shouldEncrypt,
      });
      await AuditService.log(
        "SYSTEM_SETTING_UPDATE",
        { key, category },
        userId,
        { ...existing, value: "[REDACTED]" },
        { ...setting, value: "[REDACTED]" },
        "SystemSetting"
      );
    } else {
      setting = await SystemSettingRepository.create({
        key,
        value: storedValue,
        category: category || "GENERAL",
        isEncrypted: shouldEncrypt,
      });
      await AuditService.log(
        "SYSTEM_SETTING_CREATE",
        { key, category },
        userId,
        null,
        { ...setting, value: "[REDACTED]" },
        "SystemSetting"
      );
    }

    if (setting.isEncrypted) {
      setting.value = decrypt(setting.value);
    }
    return setting;
  }

  /**
   * Lists all setting keys
   */
  static async listSettings(category) {
    const list = category
      ? await SystemSettingRepository.findByCategory(category)
      : await SystemSettingRepository.findAll();

    return list.map((item) => {
      const cloned = { ...item };
      if (cloned.isEncrypted) {
        cloned.value = decrypt(cloned.value);
      }
      return cloned;
    });
  }

  /**
   * Deletes a setting record
   */
  static async deleteSetting(key, userId) {
    const existing = await SystemSettingRepository.findByKey(key);
    if (!existing) {
      throw new NotFoundError(`System setting for key "${key}" not found.`);
    }

    await SystemSettingRepository.delete(key);
    await AuditService.log(
      "SYSTEM_SETTING_DELETE",
      { key },
      userId,
      { ...existing, value: "[REDACTED]" },
      null,
      "SystemSetting"
    );
  }
}
