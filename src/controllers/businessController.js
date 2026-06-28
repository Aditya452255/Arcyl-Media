import { BusinessService } from "../services/businessService";
import { BusinessRepository } from "../repositories/businessRepository";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const quoteSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
  services: z.unknown(), // array of services JSON
  estimatedCost: z.number().min(0, "Estimated cost cannot be negative"),
  notes: z.string().optional().nullable(),
  expiry: z.string().transform((val) => new Date(val)),
});

const proposalSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
  projectId: z.string().uuid("Invalid project ID").optional().nullable(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  scopeOfWork: z.string().optional().nullable(),
  timeline: z.string().optional().nullable(),
  deliverables: z.unknown().optional().nullable(),
  price: z.number().min(0),
  currency: z.string().optional().default("USD"),
  tax: z.number().optional().default(0),
  discount: z.number().optional().default(0),
  validUntil: z.string().transform((val) => new Date(val)),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"]).optional(),
});

const invoiceSchema = z.object({
  clientId: z.string().uuid("Invalid client ID"),
  projectId: z.string().uuid("Invalid project ID").optional().nullable(),
  dueDate: z.string().transform((val) => new Date(val)),
  amount: z.number().min(0),
  tax: z.number().optional().default(0),
  discount: z.number().optional().default(0),
  status: z.enum(["DRAFT", "SENT", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"]).optional(),
});

export class BusinessController {
  // Quotes
  static async getQuotes(req) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const skip = (page - 1) * limit;
    const [list, total] = await Promise.all([
      BusinessRepository.findQuotes({ skip, take: limit, search }),
      BusinessRepository.countQuotes({ search }),
    ]);

    return ApiResponse.success("Quotes retrieved successfully", {
      list,
      pagination: { page, limit, total },
    }, 200);
  }

  static async createQuote(req) {
    const body = await req.json();
    const parsed = quoteSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        "Validation failed",
        parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      );
    }
    const quote = await BusinessService.createQuote(parsed.data, req.user.id);
    return ApiResponse.success("Quote created successfully", quote, 201);
  }

  static async updateQuote(req, id) {
    const body = await req.json();
    const parsed = quoteSchema.partial().safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        "Validation failed",
        parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      );
    }
    const quote = await BusinessService.updateQuote(id, parsed.data, req.user.id);
    return ApiResponse.success("Quote updated successfully", quote, 200);
  }

  static async deleteQuote(req, id) {
    await BusinessService.deleteQuote(id, req.user.id);
    return ApiResponse.success("Quote deleted successfully", null, 200);
  }

  static async convertQuote(req, id) {
    const proposal = await BusinessService.convertQuoteToProposal(id, req.user.id);
    return ApiResponse.success("Quote converted to Proposal successfully", proposal, 201);
  }

  // Proposals
  static async getProposals(req) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const skip = (page - 1) * limit;
    const [list, total] = await Promise.all([
      BusinessRepository.findProposals({ skip, take: limit, status, search }),
      BusinessRepository.countProposals({ status, search }),
    ]);

    return ApiResponse.success("Proposals retrieved successfully", {
      list,
      pagination: { page, limit, total },
    }, 200);
  }

  static async getProposal(req, id) {
    const proposal = await BusinessRepository.findProposalById(id);
    if (!proposal) {
      return ApiResponse.error("Proposal not found", 404);
    }
    return ApiResponse.success("Proposal details retrieved", proposal, 200);
  }

  static async createProposal(req) {
    const body = await req.json();
    const parsed = proposalSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        "Validation failed",
        parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      );
    }
    const proposal = await BusinessService.createProposal(parsed.data, req.user.id);
    return ApiResponse.success("Proposal created successfully", proposal, 201);
  }

  static async updateProposal(req, id) {
    const body = await req.json();
    const parsed = proposalSchema.partial().safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        "Validation failed",
        parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      );
    }
    const proposal = await BusinessService.updateProposal(id, parsed.data, req.user.id);
    return ApiResponse.success("Proposal updated successfully", proposal, 200);
  }

  static async duplicateProposal(req, id) {
    const copy = await BusinessService.duplicateProposal(id, req.user.id);
    return ApiResponse.success("Proposal duplicated successfully", copy, 201);
  }

  static async deleteProposal(req, id) {
    await BusinessService.deleteProposal(id, req.user.id);
    return ApiResponse.success("Proposal deleted successfully", null, 200);
  }

  static async emailProposal(req, id) {
    await BusinessService.sendProposalEmail(id, req.user.id);
    return ApiResponse.success("Proposal dispatched via email successfully", null, 200);
  }

  // Invoices
  static async getInvoices(req) {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const skip = (page - 1) * limit;
    const [list, total] = await Promise.all([
      BusinessRepository.findInvoices({ skip, take: limit, status, search }),
      BusinessRepository.countInvoices({ status, search }),
    ]);

    return ApiResponse.success("Invoices retrieved successfully", {
      list,
      pagination: { page, limit, total },
    }, 200);
  }

  static async getInvoice(req, id) {
    const invoice = await BusinessRepository.findInvoiceById(id);
    if (!invoice) {
      return ApiResponse.error("Invoice not found", 404);
    }
    return ApiResponse.success("Invoice details retrieved", invoice, 200);
  }

  static async createInvoice(req) {
    const body = await req.json();
    const parsed = invoiceSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        "Validation failed",
        parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      );
    }
    const data = parsed.data;
    // Calculate total: total = (amount + tax) - discount
    const total = (data.amount + data.tax) - data.discount;
    const invoice = await BusinessService.createInvoice({ ...data, total }, req.user.id);
    return ApiResponse.success("Invoice created successfully", invoice, 201);
  }

  static async updateInvoice(req, id) {
    const body = await req.json();
    const parsed = invoiceSchema.partial().safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(
        "Validation failed",
        parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      );
    }
    const data = parsed.data;
    if (data.amount !== undefined || data.tax !== undefined || data.discount !== undefined) {
      // Re-calculate total
      const existing = await BusinessRepository.findInvoiceById(id);
      const amount = data.amount !== undefined ? data.amount : existing.amount;
      const tax = data.tax !== undefined ? data.tax : existing.tax;
      const discount = data.discount !== undefined ? data.discount : existing.discount;
      data.total = (amount + tax) - discount;
    }
    const invoice = await BusinessService.updateInvoice(id, data, req.user.id);
    return ApiResponse.success("Invoice updated successfully", invoice, 200);
  }

  static async deleteInvoice(req, id) {
    await BusinessService.deleteInvoice(id, req.user.id);
    return ApiResponse.success("Invoice deleted successfully", null, 200);
  }

  static async emailInvoice(req, id) {
    await BusinessService.sendInvoiceEmail(id, req.user.id);
    return ApiResponse.success("Invoice dispatched via email successfully", null, 200);
  }

  // Dashboard Stats
  static async getStats(req) {
    const stats = await BusinessService.getBusinessStats();
    return ApiResponse.success("Business statistics retrieved", stats, 200);
  }

  // Client Timeline
  static async getClientTimeline(req, clientId) {
    const timeline = await BusinessRepository.compileClientTimeline(clientId);
    return ApiResponse.success("Client timeline details compiled", timeline, 200);
  }
}
