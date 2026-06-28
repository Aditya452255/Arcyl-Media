import { WidgetRepository } from "../repositories/widgetRepository";

const DEFAULT_WIDGETS = [
  { widgetKey: "CRM_LEADS", isVisible: true, displayOrder: 1, preferences: {} },
  { widgetKey: "OPERATIONS_METRICS", isVisible: true, displayOrder: 2, preferences: {} },
  { widgetKey: "SYSTEM_HEALTH", isVisible: true, displayOrder: 3, preferences: {} },
  { widgetKey: "CMS_STATUS", isVisible: true, displayOrder: 4, preferences: {} },
];

export class WidgetService {
  /**
   * Returns list of configured dashboard widgets
   */
  static async getWidgets(userId) {
    const list = await WidgetRepository.getUserWidgets(userId);
    if (list.length > 0) return list;

    // Return defaults if none configured
    return DEFAULT_WIDGETS.map((w) => ({
      ...w,
      userId,
      id: `default-${w.widgetKey}`,
    }));
  }

  /**
   * Configures visibility, ordering, or preferences of specific widget
   */
  static async saveWidget(userId, widgetKey, data) {
    return await WidgetRepository.upsertWidget(userId, widgetKey, {
      isVisible: data.isVisible ?? true,
      displayOrder: data.displayOrder ?? 0,
      preferences: data.preferences ?? {},
    });
  }
}
