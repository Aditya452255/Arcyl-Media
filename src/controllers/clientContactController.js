import { ClientContactService } from "../services/clientContactService";
import { ApiResponse } from "../utils/apiResponse";
import { ValidationError } from "../utils/errors";
import { z } from "zod";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  position: z.string().optional().nullable(),
  email: z.string().email("Invalid email"),
  phone: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  birthday: z.string().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  notes: z.string().optional().nullable(),
  preferredContactMethod: z.string().optional().nullable(),
});

export class ClientContactController {
  static async list(req, clientId) {
    return ApiResponse.success("Contacts retrieved", await ClientContactService.getContactsByClient(clientId), 200);
  }

  static async create(req, clientId) {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Contact created", await ClientContactService.addContact(clientId, parsed.data, req.user?.id), 201);
  }

  static async update(req, clientId, contactId) {
    const body = await req.json();
    const parsed = contactSchema.partial().safeParse(body);
    if (!parsed.success) throw new ValidationError("Validation failed", parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
    return ApiResponse.success("Contact updated", await ClientContactService.updateContact(contactId, parsed.data, req.user?.id), 200);
  }

  static async delete(req, clientId, contactId) {
    await ClientContactService.deleteContact(contactId, req.user?.id);
    return ApiResponse.success("Contact deleted", null, 200);
  }
}
