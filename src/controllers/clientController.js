import { ClientService } from "../services/clientService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const clientSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  logo: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  gst: z.string().optional().nullable(),
  pan: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  timezone: z.string().default("UTC"),
  currency: z.string().default("USD"),
  status: z.enum(["ACTIVE", "INACTIVE", "PROSPECT", "ARCHIVED"]).default("ACTIVE"),
  notes: z.string().optional().nullable(),
});

export class ClientController {
  static async create(req) {
    const body = await req.json();
    const parsed = clientSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Client created successfully", await ClientService.createClient(parsed.data, req.user?.id), 201);
  }

  static async update(req, id) {
    const body = await req.json();
    const parsed = clientSchema.partial().safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Client updated successfully", await ClientService.updateClient(id, parsed.data, req.user?.id), 200);
  }

  static async getById(req, id) {
    return ApiResponse.success("Client retrieved successfully", await ClientService.getClientById(id), 200);
  }

  static async delete(req, id) {
    await ClientService.softDeleteClient(id, req.user?.id);
    return ApiResponse.success("Client deleted successfully", null, 200);
  }

  static async archive(req, id) {
    const body = await req.json().catch(() => ({}));
    const isArchived = body.isArchived !== false;
    return ApiResponse.success("Client archive status updated", await ClientService.archiveClient(id, isArchived, req.user?.id), 200);
  }

  static async getList(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const result = await ClientService.getClientsList({
      skip: (page - 1) * limit, take: limit,
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });
    return ApiResponse.success("Clients retrieved successfully", result.data, 200, result.pagination);
  }
}
