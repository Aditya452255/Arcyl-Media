import prisma from "../config/db";

export class BusinessRepository {
  // Quotes
  static async createQuote(data) {
    return prisma.quote.create({
      data,
      include: { client: { select: { id: true, companyName: true } } },
    });
  }

  static async updateQuote(id, data) {
    return prisma.quote.update({
      where: { id },
      data,
      include: { client: { select: { id: true, companyName: true } } },
    });
  }

  static async findQuoteById(id) {
    return prisma.quote.findFirst({
      where: { id, isDeleted: false },
      include: { client: true },
    });
  }

  static async findQuotes({ skip = 0, take = 20, search = "" }) {
    const where = { isDeleted: false };
    if (search) {
      where.client = {
        companyName: { contains: search, mode: "insensitive" },
      };
    }
    return prisma.quote.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { client: { select: { id: true, companyName: true } } },
    });
  }

  static async countQuotes({ search = "" }) {
    const where = { isDeleted: false };
    if (search) {
      where.client = {
        companyName: { contains: search, mode: "insensitive" },
      };
    }
    return prisma.quote.count({ where });
  }

  // Proposals
  static async createProposal(data) {
    const count = await prisma.proposal.count();
    const proposalNumber = `ARC-PROP-${String(count + 1).padStart(5, "0")}`;
    return prisma.proposal.create({
      data: { ...data, proposalNumber },
      include: {
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  static async updateProposal(id, data) {
    return prisma.proposal.update({
      where: { id },
      data,
      include: {
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  static async findProposalById(id) {
    return prisma.proposal.findFirst({
      where: { id, isDeleted: false },
      include: { client: true, project: true },
    });
  }

  static async findProposals({ skip = 0, take = 20, status, search = "" }) {
    const where = { isDeleted: false };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { proposalNumber: { contains: search, mode: "insensitive" } },
      ];
    }
    return prisma.proposal.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  static async countProposals({ status, search = "" }) {
    const where = { isDeleted: false };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { proposalNumber: { contains: search, mode: "insensitive" } },
      ];
    }
    return prisma.proposal.count({ where });
  }

  // Invoices
  static async createInvoice(data) {
    const count = await prisma.invoice.count();
    const invoiceNumber = `ARC-INV-${String(count + 1).padStart(5, "0")}`;
    return prisma.invoice.create({
      data: { ...data, invoiceNumber },
      include: {
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  static async updateInvoice(id, data) {
    return prisma.invoice.update({
      where: { id },
      data,
      include: {
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  static async findInvoiceById(id) {
    return prisma.invoice.findFirst({
      where: { id, isDeleted: false },
      include: { client: true, project: true },
    });
  }

  static async findInvoices({ skip = 0, take = 20, status, search = "" }) {
    const where = { isDeleted: false };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { client: { companyName: { contains: search, mode: "insensitive" } } },
      ];
    }
    return prisma.invoice.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  static async countInvoices({ status, search = "" }) {
    const where = { isDeleted: false };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { client: { companyName: { contains: search, mode: "insensitive" } } },
      ];
    }
    return prisma.invoice.count({ where });
  }

  // Client Timeline chronological aggregates
  static async compileClientTimeline(clientId) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { contacts: true },
    });
    if (!client) return [];

    const timelineEvents = [];

    // 1. Leads
    const contactEmails = client.contacts.map((c) => c.email);
    const leads = await prisma.lead.findMany({
      where: { email: { in: contactEmails } },
    });
    leads.forEach((l) => {
      timelineEvents.push({
        date: l.createdAt,
        type: "LEAD_CREATED",
        title: "Lead Created",
        description: `Lead registered for ${l.name} from ${l.company || "organization"}.`,
      });
    });

    // 2. Proposals
    const proposals = await prisma.proposal.findMany({
      where: { clientId, isDeleted: false },
    });
    proposals.forEach((p) => {
      timelineEvents.push({
        date: p.createdAt,
        type: "PROPOSAL_CREATED",
        title: "Proposal Prepared",
        description: `Draft prepared: Proposal ${p.proposalNumber} - "${p.title}" for $${p.price}.`,
      });
      if (p.status === "SENT") {
        timelineEvents.push({
          date: p.updatedAt,
          type: "PROPOSAL_SENT",
          title: "Proposal Dispatched",
          description: `Proposal ${p.proposalNumber} sent to client.`,
        });
      }
      if (p.status === "ACCEPTED") {
        timelineEvents.push({
          date: p.updatedAt,
          type: "PROPOSAL_ACCEPTED",
          title: "Proposal Accepted",
          description: `Proposal ${p.proposalNumber} accepted by client.`,
        });
      }
    });

    // 3. Projects
    const projects = await prisma.project.findMany({
      where: { clientId, isDeleted: false },
      include: { deliverables: true },
    });
    projects.forEach((proj) => {
      timelineEvents.push({
        date: proj.createdAt,
        type: "PROJECT_CREATED",
        title: "Project Created",
        description: `Project "${proj.name}" kicked off. status: ${proj.status}.`,
      });

      // 4. Deliverables
      proj.deliverables.forEach((del) => {
        if (del.status === "SUBMITTED" || del.approvalStatus === "PENDING") {
          timelineEvents.push({
            date: del.createdAt,
            type: "DELIVERABLE_SUBMITTED",
            title: "Deliverable Shared",
            description: `Deliverable "${del.title}" v${del.version} submitted for review.`,
          });
        }
        if (del.approvalStatus === "APPROVED") {
          timelineEvents.push({
            date: del.updatedAt,
            type: "DELIVERABLE_APPROVED",
            title: "Deliverable Approved",
            description: `Client approved deliverable "${del.title}".`,
          });
        }
        if (del.approvalStatus === "REJECTED") {
          timelineEvents.push({
            date: del.updatedAt,
            type: "DELIVERABLE_REJECTED",
            title: "Deliverable Revised Request",
            description: `Client requested revisions for "${del.title}": "${del.feedback || ""}".`,
          });
        }
      });
    });

    // 5. Invoices
    const invoices = await prisma.invoice.findMany({
      where: { clientId, isDeleted: false },
    });
    invoices.forEach((inv) => {
      timelineEvents.push({
        date: inv.createdAt,
        type: "INVOICE_CREATED",
        title: "Invoice Issued",
        description: `Billing invoice ${inv.invoiceNumber} generated for $${inv.total}.`,
      });
      if (inv.status === "SENT") {
        timelineEvents.push({
          date: inv.updatedAt,
          type: "INVOICE_SENT",
          title: "Invoice Dispatched",
          description: `Billing invoice ${inv.invoiceNumber} sent to client.`,
        });
      }
      if (inv.status === "PAID") {
        timelineEvents.push({
          date: inv.updatedAt,
          type: "INVOICE_PAID",
          title: "Invoice Paid",
          description: `Payment received: Invoice ${inv.invoiceNumber} paid in full.`,
        });
      }
    });

    // Sort chronologically (ascending by date)
    return timelineEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
}
