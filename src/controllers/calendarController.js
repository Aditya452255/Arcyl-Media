import { CalendarService } from "../services/calendarService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  type: z.enum(["MEETING", "DEADLINE", "MILESTONE", "REMINDER", "BIRTHDAY", "OTHER"]).default("OTHER"),
  startAt: z.string().transform((v) => new Date(v)),
  endAt: z.string().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  isAllDay: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurrence: z.any().optional().nullable(),
  projectId: z.string().optional().nullable(),
  milestoneId: z.string().optional().nullable(),
});

export class CalendarController {
  static async list(req) {
    const { searchParams } = new URL(req.url);
    return ApiResponse.success("Calendar events retrieved", await CalendarService.getEvents({
      startAt: searchParams.get("startAt") || undefined,
      endAt: searchParams.get("endAt") || undefined,
      type: searchParams.get("type") || undefined,
      projectId: searchParams.get("projectId") || undefined,
    }), 200);
  }
  static async create(req) {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Calendar event created", await CalendarService.createEvent(parsed.data, req.user?.id), 201);
  }
  static async update(req, id) {
    const body = await req.json();
    const parsed = schema.partial().safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Calendar event updated", await CalendarService.updateEvent(id, parsed.data, req.user?.id), 200);
  }
  static async delete(req, id) {
    await CalendarService.deleteEvent(id, req.user?.id);
    return ApiResponse.success("Calendar event deleted", null, 200);
  }
}
