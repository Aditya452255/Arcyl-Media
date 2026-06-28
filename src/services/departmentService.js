import { DepartmentRepository } from "../repositories/departmentRepository";
import { EmployeeRepository } from "../repositories/employeeRepository";
import { AuditService } from "./auditService";
import { NotFoundError, ValidationError } from "../utils/errors";

export class DepartmentService {
  static async createDepartment(data, userId) {
    const existing = await DepartmentRepository.findByName(data.name);
    if (existing) {
      throw new ValidationError(`Department with name "${data.name}" already exists.`);
    }

    if (data.managerId) {
      const emp = await EmployeeRepository.findById(data.managerId);
      if (!emp) {
        throw new NotFoundError(`Employee manager with ID "${data.managerId}" not found.`);
      }
    }

    const dept = await DepartmentRepository.create(data);

    await AuditService.log(
      "DEPARTMENT_CREATE",
      { departmentId: dept.id, name: dept.name },
      userId,
      null,
      dept,
      "Department"
    );

    return dept;
  }

  static async updateDepartment(id, data, userId) {
    const existing = await DepartmentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Department not found");
    }

    if (data.name && data.name !== existing.name) {
      const conflict = await DepartmentRepository.findByName(data.name);
      if (conflict) {
        throw new ValidationError(`Department with name "${data.name}" already exists.`);
      }
    }

    if (data.managerId) {
      const emp = await EmployeeRepository.findById(data.managerId);
      if (!emp) {
        throw new NotFoundError(`Employee manager with ID "${data.managerId}" not found.`);
      }
    }

    const dept = await DepartmentRepository.update(id, data);

    await AuditService.log(
      "DEPARTMENT_UPDATE",
      { departmentId: id },
      userId,
      existing,
      dept,
      "Department"
    );

    return dept;
  }

  static async getDepartmentById(id) {
    const dept = await DepartmentRepository.findById(id);
    if (!dept) {
      throw new NotFoundError("Department not found");
    }
    return dept;
  }

  static async deleteDepartment(id, userId) {
    const existing = await DepartmentRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Department not found");
    }

    // Check if there are active employees before deleting
    if (existing.employees?.length > 0) {
      throw new ValidationError("Cannot delete department that contains active employees.");
    }

    await DepartmentRepository.delete(id);

    await AuditService.log(
      "DEPARTMENT_DELETE",
      { departmentId: id, name: existing.name },
      userId,
      existing,
      null,
      "Department"
    );
  }

  static async getDepartmentsList() {
    return await DepartmentRepository.findAll();
  }

  /**
   * Seeds the default departments if the database table is empty
   */
  static async seedDefaults(userId) {
    const list = await DepartmentRepository.findAll();
    if (list.length > 0) return list;

    const defaults = [
      "Development",
      "Design",
      "Marketing",
      "AI",
      "Sales",
      "HR",
      "Finance",
      "Operations",
    ];

    const seeded = [];
    for (const name of defaults) {
      const dept = await DepartmentRepository.create({ name });
      seeded.push(dept);
      await AuditService.log(
        "DEPARTMENT_SEED",
        { name },
        userId || "system",
        null,
        dept,
        "Department"
      );
    }
    return seeded;
  }
}
