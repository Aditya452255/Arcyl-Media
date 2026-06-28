import { TimeEntryRepository } from "../repositories/timeEntryRepository";
import { ProjectRepository } from "../repositories/projectRepository";
import { EmployeeRepository } from "../repositories/employeeRepository";
import { AuditService } from "./auditService";
import { NotFoundError, ValidationError } from "../utils/errors";
import prisma from "../config/db";

export class TimeEntryService {
  static async logTime(projectId, data, userId) {
    const [project, employee] = await Promise.all([
      ProjectRepository.findById(projectId),
      EmployeeRepository.findById(data.employeeId),
    ]);
    if (!project) throw new NotFoundError("Project not found");
    if (!employee) throw new NotFoundError("Employee not found");

    // Auto-compute duration in minutes if both times provided
    let duration = data.duration;
    if (!duration && data.startTime && data.endTime) {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      if (end <= start) throw new ValidationError("End time must be after start time");
      duration = Math.round((end - start) / 60000);
    }

    const entry = await TimeEntryRepository.create({ ...data, projectId, duration });
    await AuditService.log("TIME_ENTRY_LOG", { projectId, employeeId: data.employeeId, duration }, userId, null, entry, "TimeEntry");
    return entry;
  }

  static async getEntriesByProject(projectId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    return TimeEntryRepository.findByProjectId(projectId);
  }

  static async getSummary(projectId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Project not found");

    const grouped = await TimeEntryRepository.getSummaryByProject(projectId);

    // Enrich with employee names
    const enriched = await Promise.all(
      grouped.map(async (g) => {
        const emp = await EmployeeRepository.findById(g.employeeId);
        return {
          employeeId: g.employeeId,
          employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "Unknown",
          totalMinutes: g._sum.duration || 0,
          totalHours: ((g._sum.duration || 0) / 60).toFixed(2),
        };
      })
    );

    const totalMinutes = enriched.reduce((acc, e) => acc + e.totalMinutes, 0);
    return { projectId, totalMinutes, totalHours: (totalMinutes / 60).toFixed(2), breakdown: enriched };
  }
}
