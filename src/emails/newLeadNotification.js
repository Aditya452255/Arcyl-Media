/**
 * Compiles admin lead notification email template
 */
export function getNewLeadNotificationTemplate(lead, submission) {
  return {
    subject: `[New Lead Inquiry] ${submission.subject}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #eaeaea; padding-bottom: 10px;">New Website Inquiry Received</h2>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Phone:</strong> ${lead.phone || "N/A"}</p>
        <p><strong>Subject:</strong> ${submission.subject}</p>
        <p><strong>Message:</strong></p>
        <div style="white-space: pre-wrap; background-color: #f5f5f5; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">${submission.message}</div>
      </div>
    `,
  };
}
