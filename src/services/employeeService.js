import { EmployeeRepository } from "../repositories/employeeRepository";
import { DepartmentRepository } from "../repositories/departmentRepository";
import { NotificationService } from "./notificationService";
import { AuditService } from "./auditService";
import { NotFoundError, ValidationError } from "../utils/errors";

export class EmployeeService {
  static async createEmployee(data, userId) {
    // Check email duplicates
    const existing = await EmployeeRepository.findByEmail(data.email);
    if (existing) {
      throw new ValidationError(`Employee with email "${data.email}" already exists.`);
    }

    // Verify department if departmentId is provided
    if (data.departmentId) {
      const dept = await DepartmentRepository.findById(data.departmentId);
      if (!dept) {
        throw new NotFoundError(`Department with ID "${data.departmentId}" not found.`);
      }
    }

    const employee = await EmployeeRepository.create(data);

    // Create system notification
    try {
      await NotificationService.notifyAll(
        "Employee Added",
        `New employee ${employee.firstName} ${employee.lastName} was added to designation "${employee.designation}".`,
        "EMPLOYEE_ADDED"
      );
    } catch (err) {
      // Don't fail create if notify errors out
    }

    // Log audit trail
    await AuditService.log(
      "EMPLOYEE_CREATE",
      { employeeId: employee.id, name: `${employee.firstName} ${employee.lastName}` },
      userId,
      null,
      employee,
      "Employee"
    );

    return employee;
  }

  static async updateEmployee(id, data, userId) {
    const existing = await EmployeeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Employee not found");
    }

    if (data.email && data.email !== existing.email) {
      const conflict = await EmployeeRepository.findByEmail(data.email);
      if (conflict) {
        throw new ValidationError(`Employee with email "${data.email}" already exists.`);
      }
    }

    if (data.departmentId) {
      const dept = await DepartmentRepository.findById(data.departmentId);
      if (!dept) {
        throw new NotFoundError(`Department with ID "${data.departmentId}" not found.`);
      }
    }

    const employee = await EmployeeRepository.update(id, data);

    await AuditService.log(
      "EMPLOYEE_UPDATE",
      { employeeId: id },
      userId,
      existing,
      employee,
      "Employee"
    );

    return employee;
  }

  static async getEmployeeById(id) {
    const employee = await EmployeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundError("Employee not found");
    }
    return employee;
  }

  static async softDeleteEmployee(id, userId) {
    const existing = await EmployeeRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Employee not found");
    }

    await EmployeeRepository.softDelete(id);

    await AuditService.log(
      "EMPLOYEE_DELETE",
      { employeeId: id, name: `${existing.firstName} ${existing.lastName}` },
      userId,
      existing,
      { ...existing, isDeleted: true },
      "Employee"
    );
  }

  static async getEmployeesList(filters) {
    const [total, data] = await Promise.all([
      EmployeeRepository.count(filters),
      EmployeeRepository.findMany(filters),
    ]);

    const limit = filters.take || 20;
    const page = Math.floor((filters.skip || 0) / limit) + 1;
    const pages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages,
        hasNext: page < pages,
        hasPrevious: page > 1,
      },
    };
  }
}
