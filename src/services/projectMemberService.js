import { ProjectMemberRepository } from "../repositories/projectMemberRepository";
import { ProjectRepository } from "../repositories/projectRepository";
import { EmployeeRepository } from "../repositories/employeeRepository";
import { AuditService } from "./auditService";
import { NotFoundError, ValidationError } from "../utils/errors";

export class ProjectMemberService {
  static async addMember(projectId, data, userId) {
    const [project, employee] = await Promise.all([
      ProjectRepository.findById(projectId),
      EmployeeRepository.findById(data.employeeId),
    ]);
    if (!project) throw new NotFoundError("Project not found");
    if (!employee) throw new NotFoundError("Employee not found");

    const existing = await ProjectMemberRepository.findExisting(projectId, data.employeeId);
    if (existing) throw new ValidationError("Employee is already a member of this project");

    const member = await ProjectMemberRepository.add({ ...data, projectId });
    await AuditService.log("PROJECT_MEMBER_ADD", { projectId, employeeId: data.employeeId }, userId, null, member, "ProjectMember");
    return member;
  }

  static async updateMember(id, data, userId) {
    const existing = await ProjectMemberRepository.findById(id);
    if (!existing) throw new NotFoundError("Project member not found");
    const member = await ProjectMemberRepository.update(id, data);
    await AuditService.log("PROJECT_MEMBER_UPDATE", { memberId: id }, userId, existing, member, "ProjectMember");
    return member;
  }

  static async removeMember(id, userId) {
    const existing = await ProjectMemberRepository.findById(id);
    if (!existing) throw new NotFoundError("Project member not found");
    await ProjectMemberRepository.remove(id);
    await AuditService.log("PROJECT_MEMBER_REMOVE", { memberId: id }, userId, existing, null, "ProjectMember");
  }

  static async getMembersByProject(projectId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    return ProjectMemberRepository.findByProjectId(projectId);
  }
}
