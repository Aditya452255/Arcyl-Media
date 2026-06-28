import { EmployeeService } from "../services/employeeService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const employeeSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional().nullable(),
  profilePhoto: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  skills: z.array(z.string()).optional().nullable(),
  designation: z.string().min(1, "Designation is required"),
  departmentId: z.string().optional().nullable(),
  joiningDate: z.string().transform((val) => new Date(val)),
  employmentStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "TERMINATED"]).default("ACTIVE"),
  github: z.string().url("Invalid GitHub URL").or(z.string().length(0)).optional().nullable(),
  linkedin: z.string().url("Invalid LinkedIn URL").or(z.string().length(0)).optional().nullable(),
  portfolioUrl: z.string().url("Invalid Portfolio URL").or(z.string().length(0)).optional().nullable(),
});

export class EmployeeController {
  static async create(req) {
    const body = await req.json();
    const parsed = employeeSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      throw new ValidationError("Validation failed", details);
    }

    const userId = req.user?.id;
    const employee = await EmployeeService.createEmployee(parsed.data, userId);
    return ApiResponse.success("Employee created successfully", employee, 201);
  }

  static async update(req, id) {
    const body = await req.json();
    // Allow partial validation for updates
    const parsed = employeeSchema.partial().safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      throw new ValidationError("Validation failed", details);
    }

    const userId = req.user?.id;
    const employee = await EmployeeService.updateEmployee(id, parsed.data, userId);
    return ApiResponse.success("Employee updated successfully", employee, 200);
  }

  static async getById(req, id) {
    const employee = await EmployeeService.getEmployeeById(id);
    return ApiResponse.success("Employee retrieved successfully", employee, 200);
  }

  static async delete(req, id) {
    const userId = req.user?.id;
    await EmployeeService.softDeleteEmployee(id, userId);
    return ApiResponse.success("Employee deleted successfully", null, 200);
  }

  static async getList(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const filters = {
      skip,
      take: limit,
      search: searchParams.get("search") || "",
      departmentId: searchParams.get("departmentId") || undefined,
      status: searchParams.get("status") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    };

    const result = await EmployeeService.getEmployeesList(filters);
    return ApiResponse.success("Employees retrieved successfully", result.data, 200, result.pagination);
  }
}
