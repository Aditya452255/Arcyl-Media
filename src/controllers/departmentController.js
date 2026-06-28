import { DepartmentService } from "../services/departmentService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  managerId: z.string().optional().nullable(),
});

export class DepartmentController {
  static async create(req) {
    const body = await req.json();
    const parsed = departmentSchema.safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      throw new ValidationError("Validation failed", details);
    }

    const userId = req.user?.id;
    const dept = await DepartmentService.createDepartment(parsed.data, userId);
    return ApiResponse.success("Department created successfully", dept, 201);
  }

  static async update(req, id) {
    const body = await req.json();
    const parsed = departmentSchema.partial().safeParse(body);
    if (!parsed.success) {
      const details = parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      throw new ValidationError("Validation failed", details);
    }

    const userId = req.user?.id;
    const dept = await DepartmentService.updateDepartment(id, parsed.data, userId);
    return ApiResponse.success("Department updated successfully", dept, 200);
  }

  static async getById(req, id) {
    const dept = await DepartmentService.getDepartmentById(id);
    return ApiResponse.success("Department retrieved successfully", dept, 200);
  }

  static async delete(req, id) {
    const userId = req.user?.id;
    await DepartmentService.deleteDepartment(id, userId);
    return ApiResponse.success("Department deleted successfully", null, 200);
  }

  static async getList(req) {
    const list = await DepartmentService.getDepartmentsList();
    return ApiResponse.success("Departments retrieved successfully", list, 200);
  }

  static async seed(req) {
    const userId = req.user?.id;
    const list = await DepartmentService.seedDefaults(userId);
    return ApiResponse.success("Default departments seeded successfully", list, 200);
  }
}
