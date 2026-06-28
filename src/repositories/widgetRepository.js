import prisma from "../config/db";

export class WidgetRepository {
  static async getUserWidgets(userId) {
    return prisma.dashboardWidget.findMany({
      where: { userId },
      orderBy: { displayOrder: "asc" },
    });
  }

  static async upsertWidget(userId, widgetKey, { isVisible, displayOrder, preferences }) {
    return prisma.dashboardWidget.upsert({
      where: {
        userId_widgetKey: { userId, widgetKey },
      },
      update: {
        isVisible,
        displayOrder,
        preferences,
      },
      create: {
        userId,
        widgetKey,
        isVisible,
        displayOrder,
        preferences,
      },
    });
  }
}
