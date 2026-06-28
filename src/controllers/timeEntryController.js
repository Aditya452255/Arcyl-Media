import { TimeEntryService } from "../services/timeEntryService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const schema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  startTime: z.string().transform((v) => new Date(v)),
  endTime: z.string().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  duration: z.number().int().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export class TimeEntryController {
  static async list(req, projectId) {
    return ApiResponse.success("Time entries retrieved", await TimeEntryService.getEntriesByProject(projectId), 200);
  }
  static async log(req, projectId) {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Time logged", await TimeEntryService.logTime(projectId, parsed.data, req.user?.id), 201);
  }
  static async summary(req, projectId) {
    return ApiResponse.success("Time summary retrieved", await TimeEntryService.getSummary(projectId), 200);
  }
}
