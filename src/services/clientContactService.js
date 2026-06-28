import { ClientContactRepository } from "../repositories/clientContactRepository";
import { ClientRepository } from "../repositories/clientRepository";
import { AuditService } from "./auditService";
import { NotFoundError } from "../utils/errors";

export class ClientContactService {
  static async addContact(clientId, data, userId) {
    const client = await ClientRepository.findById(clientId);
    if (!client) throw new NotFoundError("Client not found");
    const contact = await ClientContactRepository.create({ ...data, clientId });
    await AuditService.log("CLIENT_CONTACT_CREATE", { contactId: contact.id, clientId }, userId, null, contact, "ClientContact");
    return contact;
  }

  static async updateContact(id, data, userId) {
    const existing = await ClientContactRepository.findById(id);
    if (!existing) throw new NotFoundError("Contact not found");
    const contact = await ClientContactRepository.update(id, data);
    await AuditService.log("CLIENT_CONTACT_UPDATE", { contactId: id }, userId, existing, contact, "ClientContact");
    return contact;
  }

  static async deleteContact(id, userId) {
    const existing = await ClientContactRepository.findById(id);
    if (!existing) throw new NotFoundError("Contact not found");
    await ClientContactRepository.softDelete(id);
    await AuditService.log("CLIENT_CONTACT_DELETE", { contactId: id }, userId, existing, null, "ClientContact");
  }

  static async getContactsByClient(clientId) {
    const client = await ClientRepository.findById(clientId);
    if (!client) throw new NotFoundError("Client not found");
    return ClientContactRepository.findByClientId(clientId);
  }
}
