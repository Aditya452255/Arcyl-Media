/**
 * Compiles visitor thank-you email template
 */
export function getThankYouEmailTemplate(name, subject) {
  return {
    subject: "Thank you for contacting Arcyl Media!",
    html: `
      <div style="font-family: sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #1a1a1a; border-bottom: 2px solid #eaeaea; padding-bottom: 10px;">We've Received Your Inquiry</h2>
        <p>Hi ${name},</p>
        <p>Thank you for reaching out to Arcyl Media! We have received your inquiry regarding <strong>"${subject}"</strong>.</p>
        <p>Our team is currently reviewing your details and we will get back to you within 24 hours.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>The Arcyl Media Team</strong></p>
      </div>
    `,
  };
}
