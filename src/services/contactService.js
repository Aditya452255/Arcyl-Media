import { LeadRepository } from "../repositories/leadRepository";
import { ContactRepository } from "../repositories/contactRepository";
import { ActivityLogRepository } from "../repositories/activityLogRepository";
import resend from "../config/resend";
import logger from "../utils/logger";

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

    // 1. Find or create Lead
    let lead = await LeadRepository.findByEmail(email);
    if (!lead) {
      lead = await LeadRepository.create({
        name,
        email,
        phone,
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
   * Dispatch email notifications to admin and thank-you email to visitor.
   */
  static async sendEmails(lead, submission) {
    const adminEmail = process.env.ADMIN_EMAIL || "arcylmedia@gmail.com";
    const emailFrom = process.env.EMAIL_FROM || "Arcyl Media <onboarding@resend.dev>";

    // Admin Notification
    try {
      await resend.emails.send({
        from: emailFrom,
        to: adminEmail,
        subject: `[New Lead Inquiry] ${submission.subject}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <h2>New Website Inquiry</h2>
            <p><strong>Name:</strong> ${lead.name}</p>
            <p><strong>Email:</strong> ${lead.email}</p>
            <p><strong>Phone:</strong> ${lead.phone || "N/A"}</p>
            <p><strong>Subject:</strong> ${submission.subject}</p>
            <p><strong>Message:</strong></p>
            <div style="white-space: pre-wrap; background-color: #f5f5f5; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">${submission.message}</div>
          </div>
        `,
      });
      logger.info({ recipient: adminEmail }, "Admin notification email sent successfully");
    } catch (err) {
      logger.error({ err, recipient: adminEmail }, "Error sending admin notification email");
    }

    // Visitor Thank-You Email
    try {
      await resend.emails.send({
        from: emailFrom,
        to: lead.email,
        subject: `Thank you for contacting Arcyl Media!`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <p>Hi ${lead.name},</p>
            <p>Thank you for reaching out to Arcyl Media! We have received your inquiry regarding <strong>"${submission.subject}"</strong>.</p>
            <p>Our team is currently reviewing your details and we will get back to you within 24 hours.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The Arcyl Media Team</strong></p>
          </div>
        `,
      });
      logger.info({ recipient: lead.email }, "Visitor thank-you email sent successfully");
    } catch (err) {
      logger.error({ err, recipient: lead.email }, "Error sending visitor thank-you email");
    }
  }
}
