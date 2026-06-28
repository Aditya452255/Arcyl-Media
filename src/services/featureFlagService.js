import { SystemSettingService } from "./systemSettingService";

export class FeatureFlagService {
  /**
   * Checks if specific module feature flag is active
   */
  static async isEnabled(flagKey) {
    const key = flagKey.startsWith("FEATURE_") ? flagKey : `FEATURE_${flagKey.toUpperCase()}`;
    const setting = await SystemSettingService.getSetting(key);
    if (!setting) {
      // Default to true for foundation modules, false for unreleased ones
      const defaultOn = ["CRM", "CMS", "OPERATIONS"].includes(flagKey.toUpperCase());
      return defaultOn;
    }
    return setting.value === "true";
  }

  /**
   * Toggles feature flag setting state
   */
  static async setFlag(flagKey, isEnabled, userId) {
    const key = flagKey.startsWith("FEATURE_") ? flagKey : `FEATURE_${flagKey.toUpperCase()}`;
    return await SystemSettingService.setSetting(
      key,
      isEnabled ? "true" : "false",
      "FEATURE_FLAG",
      userId
    );
  }

  /**
   * Returns list of configured feature flags
   */
  static async listFlags() {
    return await SystemSettingService.listSettings("FEATURE_FLAG");
  }
}
