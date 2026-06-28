import { LeadRepository } from "../repositories/leadRepository";
import { ContactRepository } from "../repositories/contactRepository";
import { ActivityLogRepository } from "../repositories/activityLogRepository";
import resend from "../config/resend";
import logger from "../utils/logger";
import { env } from "../config/env";
import { LEAD_STATUS } from "../constants/status";
import { getThankYouEmailTemplate } from "../emails/thankYouEmail";
import { getNewLeadNotificationTemplate } from "../emails/newLeadNotification";

export class ContactService {
  /**
   * Processes contact submission:
   * 1. Matches or creates lead.
   * 2. Saves contact submission.
   * 3. Dispatches admin and visitor emails.
   * 4. Log interaction in ActivityLog.
   */
  static async handleContactSubmission(data, ipAddress, userAgent) {
    const { name, email, phone, subject, message } = data;

    // 1. Find or create Lead (using status constant)
    let lead = await LeadRepository.findByEmail(email);
    if (!lead) {
      lead = await LeadRepository.create({
        name,
        email,
        phone,
        status: LEAD_STATUS.NEW,
      });
      logger.info({ leadId: lead.id }, "New lead created");
    } else {
      // Update info if different
      const updateData = {};
      if (lead.name !== name) updateData.name = name;
      if (phone && lead.phone !== phone) updateData.phone = phone;

      if (Object.keys(updateData).length > 0) {
        lead = await LeadRepository.update(lead.id, updateData);
        logger.info({ leadId: lead.id }, "Lead updated with new contact details");
      }
    }

    // 2. Save Contact Submission
    const submission = await ContactRepository.create({
      leadId: lead.id,
      subject,
      message,
    });
    logger.info({ submissionId: submission.id }, "Contact submission recorded");

    // 3. Log System Action
    await ActivityLogRepository.create({
      action: "CONTACT_FORM_SUBMISSION",
      details: {
        leadId: lead.id,
        submissionId: submission.id,
        subject,
      },
      ipAddress,
      userAgent,
    });

    // 4. Send email notifications asynchronously (non-blocking)
    this.sendEmails(lead, submission).catch((err) => {
      logger.error({ err }, "Unhandled error during email dispatch");
    });

    return submission;
  }

  /**
   * Dispatch email notifications using compiled email templates.
   */
  static async sendEmails(lead, submission) {
    const adminEmail = env.ADMIN_EMAIL;
    const emailFrom = env.EMAIL_FROM;

    // Admin Notification
    try {
      const template = getNewLeadNotificationTemplate(lead, submission);
      await resend.emails.send({
        from: emailFrom,
        to: adminEmail,
        subject: template.subject,
        html: template.html,
      });
      logger.info({ recipient: adminEmail }, "Admin notification email sent successfully");
    } catch (err) {
      logger.error({ err, recipient: adminEmail }, "Error sending admin notification email");
    }

    // Visitor Thank-You Email
    try {
      const template = getThankYouEmailTemplate(lead.name, submission.subject);
      await resend.emails.send({
        from: emailFrom,
        to: lead.email,
        subject: template.subject,
        html: template.html,
      });
      logger.info({ recipient: lead.email }, "Visitor thank-you email sent successfully");
    } catch (err) {
      logger.error({ err, recipient: lead.email }, "Error sending visitor thank-you email");
    }
  }
}
