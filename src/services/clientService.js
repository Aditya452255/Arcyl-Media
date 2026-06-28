import { ClientRepository } from "../repositories/clientRepository";
import { AuditService } from "./auditService";
import { NotificationService } from "./notificationService";
import { NotFoundError, ValidationError } from "../utils/errors";

export class ClientService {
  static async createClient(data, userId) {
    const client = await ClientRepository.create(data);
    await AuditService.log("CLIENT_CREATE", { clientId: client.id, companyName: client.companyName }, userId, null, client, "Client");
    try {
      await NotificationService.notifyAll("New Client Added", `Client "${client.companyName}" was added to the system.`, "LEAD_CREATED");
    } catch (_) {}
    return client;
  }

  static async updateClient(id, data, userId) {
    const existing = await ClientRepository.findById(id);
    if (!existing) throw new NotFoundError("Client not found");
    const client = await ClientRepository.update(id, data);
    await AuditService.log("CLIENT_UPDATE", { clientId: id }, userId, existing, client, "Client");
    return client;
  }

  static async getClientById(id) {
    const client = await ClientRepository.findById(id);
    if (!client) throw new NotFoundError("Client not found");
    return client;
  }

  static async softDeleteClient(id, userId) {
    const existing = await ClientRepository.findById(id);
    if (!existing) throw new NotFoundError("Client not found");
    await ClientRepository.softDelete(id);
    await AuditService.log("CLIENT_DELETE", { clientId: id }, userId, existing, null, "Client");
  }

  static async archiveClient(id, isArchived, userId) {
    const existing = await ClientRepository.findById(id);
    if (!existing) throw new NotFoundError("Client not found");
    const client = await ClientRepository.archive(id, isArchived);
    await AuditService.log(isArchived ? "CLIENT_ARCHIVE" : "CLIENT_UNARCHIVE", { clientId: id }, userId, existing, client, "Client");
    return client;
  }

  static async getClientsList(filters) {
    const [total, data] = await Promise.all([
      ClientRepository.count(filters),
      ClientRepository.findMany(filters),
    ]);
    const limit = filters.take || 20;
    const page = Math.floor((filters.skip || 0) / limit) + 1;
    const pages = Math.ceil(total / limit);
    return { data, pagination: { total, page, limit, pages, hasNext: page < pages, hasPrevious: page > 1 } };
  }
}
