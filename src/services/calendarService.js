import { CalendarRepository } from "../repositories/calendarRepository";
import { AuditService } from "./auditService";
import { NotFoundError } from "../utils/errors";

export class CalendarService {
  static async createEvent(data, userId) {
    const event = await CalendarRepository.create({ ...data, createdById: userId });
    await AuditService.log("CALENDAR_EVENT_CREATE", { eventId: event.id, title: event.title }, userId, null, event, "CalendarEvent");
    return event;
  }

  static async updateEvent(id, data, userId) {
    const existing = await CalendarRepository.findById(id);
    if (!existing) throw new NotFoundError("Calendar event not found");
    const event = await CalendarRepository.update(id, data);
    await AuditService.log("CALENDAR_EVENT_UPDATE", { eventId: id }, userId, existing, event, "CalendarEvent");
    return event;
  }

  static async deleteEvent(id, userId) {
    const existing = await CalendarRepository.findById(id);
    if (!existing) throw new NotFoundError("Calendar event not found");
    await CalendarRepository.softDelete(id);
    await AuditService.log("CALENDAR_EVENT_DELETE", { eventId: id }, userId, existing, null, "CalendarEvent");
  }

  static async getEvents(filters) {
    return CalendarRepository.findMany(filters);
  }
}
