import { BusinessRepository } from "../repositories/businessRepository";
import { AuditService } from "./auditService";
import { NotificationService } from "./notificationService";
import { NotFoundError, ValidationError } from "../utils/errors";
import resend from "../config/resend";
import { env } from "../config/env";
import prisma from "../config/db";

export class BusinessService {
  // Quotes CRUD
  static async createQuote(data, userId) {
    const quote = await BusinessRepository.createQuote(data);
    await AuditService.log("QUOTE_CREATE", { quoteId: quote.id }, userId, null, quote, "Quote");
    return quote;
  }

  static async updateQuote(id, data, userId) {
    const existing = await BusinessRepository.findQuoteById(id);
    if (!existing) throw new NotFoundError("Quote not found");
    const quote = await BusinessRepository.updateQuote(id, data);
    await AuditService.log("QUOTE_UPDATE", { quoteId: id }, userId, existing, quote, "Quote");
    return quote;
  }

  static async deleteQuote(id, userId) {
    const existing = await BusinessRepository.findQuoteById(id);
    if (!existing) throw new NotFoundError("Quote not found");
    await BusinessRepository.updateQuote(id, { isDeleted: true });
    await AuditService.log("QUOTE_DELETE", { quoteId: id }, userId, existing, null, "Quote");
  }

  static async convertQuoteToProposal(quoteId, userId) {
    const quote = await BusinessRepository.findQuoteById(quoteId);
    if (!quote) throw new NotFoundError("Quote not found");
    if (quote.isConverted) throw new ValidationError("Quote has already been converted");

    // Map quote services list to proposal deliverables JSON structure
    const proposal = await BusinessRepository.createProposal({
      clientId: quote.clientId,
      title: `Proposal from Quote - ${new Date().toLocaleDateString()}`,
      description: quote.notes,
      price: quote.estimatedCost,
      deliverables: quote.services,
      validUntil: quote.expiry,
      status: "DRAFT",
    });

    await BusinessRepository.updateQuote(quoteId, { isConverted: true });

    await AuditService.log("QUOTE_CONVERT", { quoteId, proposalId: proposal.id }, userId, quote, proposal, "Quote");
    return proposal;
  }

  // Proposals CRUD
  static async createProposal(data, userId) {
    const proposal = await BusinessRepository.createProposal(data);
    await AuditService.log("PROPOSAL_CREATE", { proposalId: proposal.id }, userId, null, proposal, "Proposal");
    return proposal;
  }

  static async updateProposal(id, data, userId) {
    const existing = await BusinessRepository.findProposalById(id);
    if (!existing) throw new NotFoundError("Proposal not found");
    const proposal = await BusinessRepository.updateProposal(id, data);
    await AuditService.log("PROPOSAL_UPDATE", { proposalId: id }, userId, existing, proposal, "Proposal");
    
    // Notify on status changes
    if (data.status && data.status !== existing.status) {
      if (data.status === "ACCEPTED") {
        await NotificationService.notifyAll(
          "Proposal Accepted! 🎉",
          `Client has accepted Proposal ${proposal.proposalNumber}: "${proposal.title}".`,
          "LEAD_CREATED"
        ).catch(() => {});
        
        // Send Proposal Accepted Confirmation Email
        await this.dispatchProposalAcceptedEmail(proposal).catch(() => {});
      }
    }

    return proposal;
  }

  static async duplicateProposal(id, userId) {
    const existing = await BusinessRepository.findProposalById(id);
    if (!existing) throw new NotFoundError("Proposal not found");

    const copy = await BusinessRepository.createProposal({
      clientId: existing.clientId,
      projectId: existing.projectId,
      title: `Copy of - ${existing.title}`,
      description: existing.description,
      scopeOfWork: existing.scopeOfWork,
      timeline: existing.timeline,
      deliverables: existing.deliverables,
      price: existing.price,
      currency: existing.currency,
      tax: existing.tax,
      discount: existing.discount,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days valid
      status: "DRAFT",
    });

    await AuditService.log("PROPOSAL_DUPLICATE", { originalId: id, copyId: copy.id }, userId, null, copy, "Proposal");
    return copy;
  }

  static async deleteProposal(id, userId) {
    const existing = await BusinessRepository.findProposalById(id);
    if (!existing) throw new NotFoundError("Proposal not found");
    await BusinessRepository.updateProposal(id, { isDeleted: true });
    await AuditService.log("PROPOSAL_DELETE", { proposalId: id }, userId, existing, null, "Proposal");
  }

  // Invoices CRUD
  static async createInvoice(data, userId) {
    const invoice = await BusinessRepository.createInvoice(data);
    await AuditService.log("INVOICE_CREATE", { invoiceId: invoice.id }, userId, null, invoice, "Invoice");
    return invoice;
  }

  static async updateInvoice(id, data, userId) {
    const existing = await BusinessRepository.findInvoiceById(id);
    if (!existing) throw new NotFoundError("Invoice not found");
    const invoice = await BusinessRepository.updateInvoice(id, data);
    await AuditService.log("INVOICE_UPDATE", { invoiceId: id }, userId, existing, invoice, "Invoice");

    if (data.status && data.status !== existing.status) {
      if (data.status === "PAID") {
        await NotificationService.notifyAll(
          "Invoice Paid! 💵",
          `Client has paid Invoice ${invoice.invoiceNumber} ($${invoice.total}).`,
          "LEAD_CREATED"
        ).catch(() => {});
        await this.dispatchInvoicePaidEmail(invoice).catch(() => {});
      }
    }

    return invoice;
  }

  static async deleteInvoice(id, userId) {
    const existing = await BusinessRepository.findInvoiceById(id);
    if (!existing) throw new NotFoundError("Invoice not found");
    await BusinessRepository.updateInvoice(id, { isDeleted: true });
    await AuditService.log("INVOICE_DELETE", { invoiceId: id }, userId, existing, null, "Invoice");
  }

  // Business Dashboard metrics
  static async getBusinessStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      pendingProposals,
      acceptedProposalsValue,
      invoicesPendingValue,
      invoicesPaidValue,
      monthlyRevenue,
      yearlyRevenue,
      recentActivity,
    ] = await Promise.all([
      // Pending Proposals
      prisma.proposal.count({ where: { status: "SENT", isDeleted: false } }),
      // Accepted Proposals Value
      prisma.proposal.aggregate({
        where: { status: "ACCEPTED", isDeleted: false },
        _sum: { price: true },
      }),
      // Invoices Pending Value (Sent / Partially Paid)
      prisma.invoice.aggregate({
        where: { status: { in: ["SENT", "PARTIALLY_PAID"] }, isDeleted: false },
        _sum: { total: true },
      }),
      // Invoices Paid Value (Total)
      prisma.invoice.aggregate({
        where: { status: "PAID", isDeleted: false },
        _sum: { total: true },
      }),
      // Revenue This Month (Paid invoices this month)
      prisma.invoice.aggregate({
        where: { status: "PAID", isDeleted: false, updatedAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      // Revenue This Year (Paid invoices this year)
      prisma.invoice.aggregate({
        where: { status: "PAID", isDeleted: false, updatedAt: { gte: startOfYear } },
        _sum: { total: true },
      }),
      // Recent transactions / activity
      prisma.activityLog.findMany({
        where: { resource: { in: ["Proposal", "Invoice", "Quote"] } },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } },
      }),
    ]);

    return {
      pendingProposalsCount: pendingProposals,
      acceptedProposalsValue: acceptedProposalsValue._sum.price || 0,
      invoicesPendingValue: invoicesPendingValue._sum.total || 0,
      invoicesPaidValue: invoicesPaidValue._sum.total || 0,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      yearlyRevenue: yearlyRevenue._sum.total || 0,
      recentActivity,
    };
  }

  // Email Despatches via Resend
  static async sendProposalEmail(proposalId, userId) {
    const proposal = await BusinessRepository.findProposalById(proposalId);
    if (!proposal) throw new NotFoundError("Proposal not found");

    const clientEmail = await this._getClientPrimaryEmail(proposal.clientId);
    if (!clientEmail) throw new ValidationError("Client email contact is missing");

    if (resend) {
      await resend.emails.send({
        from: env.EMAIL_FROM || "Arcyl Media <onboarding@resend.dev>",
        to: clientEmail,
        subject: `Proposal Dispatched: ${proposal.proposalNumber} - ${proposal.title}`,
        html: `<div style="font-family: sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 600px; margin: auto;">
          <h2 style="color: #6366f1; margin-top: 0;">New Proposal Submission</h2>
          <p>Dear Client,</p>
          <p>We have prepared a new project proposal for you: <strong>"${proposal.title}"</strong>.</p>
          <p><strong>Proposal ID:</strong> ${proposal.proposalNumber}<br/>
             <strong>Total Price:</strong> $${proposal.price.toLocaleString()}<br/>
             <strong>Validity:</strong> Until ${new Date(proposal.validUntil).toLocaleDateString()}</p>
          <div style="margin: 24px 0;">
            <a href="${env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/client" style="background-color: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Review & Accept Proposal</a>
          </div>
          <small style="color: #64748b;">Terms & Conditions apply. For feedback, reply directly to this thread.</small>
        </div>`,
      });
      
      // Update Proposal status to SENT
      await BusinessRepository.updateProposal(proposalId, { status: "SENT" });
      await AuditService.log("PROPOSAL_SENT_EMAIL", { proposalId, recipient: clientEmail }, userId, null, null, "Proposal");
    }
  }

  static async sendInvoiceEmail(invoiceId, userId) {
    const invoice = await BusinessRepository.findInvoiceById(invoiceId);
    if (!invoice) throw new NotFoundError("Invoice not found");

    const clientEmail = await this._getClientPrimaryEmail(invoice.clientId);
    if (!clientEmail) throw new ValidationError("Client email contact is missing");

    if (resend) {
      await resend.emails.send({
        from: env.EMAIL_FROM || "Arcyl Media <onboarding@resend.dev>",
        to: clientEmail,
        subject: `Invoice Billing Issued: ${invoice.invoiceNumber}`,
        html: `<div style="font-family: sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 600px; margin: auto;">
          <h2 style="color: #6366f1; margin-top: 0;">New Invoice Issued</h2>
          <p>Dear Client,</p>
          <p>Please find details of your invoice below:</p>
          <p><strong>Invoice ID:</strong> ${invoice.invoiceNumber}<br/>
             <strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}<br/>
             <strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}<br/>
             <strong>Total Due:</strong> $${invoice.total.toLocaleString()}</p>
          <div style="margin: 24px 0;">
            <a href="${env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/client" style="background-color: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Make Secure Payment</a>
          </div>
          <small style="color: #64748b;">Terms: Net 15 days. Thank you for your partnership!</small>
        </div>`,
      });

      // Update Invoice status to SENT
      await BusinessRepository.updateInvoice(invoiceId, { status: "SENT" });
      await AuditService.log("INVOICE_SENT_EMAIL", { invoiceId, recipient: clientEmail }, userId, null, null, "Invoice");
    }
  }

  // Confirmation email alerts
  static async dispatchProposalAcceptedEmail(proposal) {
    const adminMail = env.ADMIN_EMAIL || "arcylmedia@gmail.com";
    if (resend) {
      await resend.emails.send({
        from: env.EMAIL_FROM || "Arcyl Media <onboarding@resend.dev>",
        to: adminMail,
        subject: `[Success Alert] Proposal Accepted: ${proposal.proposalNumber}`,
        html: `<h3>Client has accepted Proposal ${proposal.proposalNumber}!</h3>
               <p><strong>Title:</strong> ${proposal.title}<br/>
                  <strong>Price:</strong> $${proposal.price}</p>
               <p>Check the admin dashboard to kickstart project mapping.</p>`,
      });
    }
  }

  static async dispatchInvoicePaidEmail(invoice) {
    const adminMail = env.ADMIN_EMAIL || "arcylmedia@gmail.com";
    if (resend) {
      await resend.emails.send({
        from: env.EMAIL_FROM || "Arcyl Media <onboarding@resend.dev>",
        to: adminMail,
        subject: `[Payment Alert] Invoice Paid: ${invoice.invoiceNumber}`,
        html: `<h3>Payment received for Invoice ${invoice.invoiceNumber}!</h3>
               <p><strong>Client ID:</strong> ${invoice.clientId}<br/>
                  <strong>Paid Total:</strong> $${invoice.total}</p>`,
      });
    }
  }

  // Private helpers
  static async _getClientPrimaryEmail(clientId) {
    const contact = await prisma.clientContact.findFirst({
      where: { clientId, isDeleted: false },
      select: { email: true },
    });
    return contact?.email || null;
  }
}
