import nodemailer from "nodemailer";

// Reuse the same SMTP configuration for all emails (OTP + invites)
function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[EMAIL] SMTP credentials missing. Emails will be logged to console only.");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendInviteEmail(
  recipientEmail: string,
  businessName: string,
  inviterName: string,
  inviteToken: string
) {
  const transporter = createTransporter();
  const frontendUrl = process.env.APP_URL || "http://localhost:5000";
  const inviteUrl = `${frontendUrl}/invite/${inviteToken}`;

  const emailContent = {
    from: `"Prodizzy Team" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: `You've been invited to join ${businessName} on Prodizzy`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Team Invitation</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; line-height: 1.6;">Hi there! 👋</p>

          <p style="font-size: 16px; line-height: 1.6;">
            <strong>${inviterName}</strong> has invited you to join their business
            <strong>${businessName}</strong> on Prodizzy.
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            As a team member, you'll be able to create campaigns, manage collaborations,
            and help grow the business together.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 14px 32px;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: bold;
                      display: inline-block;
                      font-size: 16px;">
              Accept Invitation
            </a>
          </div>

          <p style="font-size: 14px; color: #666; line-height: 1.6;">
            Or copy and paste this link into your browser:<br/>
            <a href="${inviteUrl}" style="color: #667eea; word-break: break-all;">${inviteUrl}</a>
          </p>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            This invitation will expire in 7 days.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          <p style="margin-top: 10px;">— The Prodizzy Team</p>
        </div>
      </div>
    `,
  };

  if (!transporter) {
    // Mock email for development
    console.log(`\n========================================`);
    console.log(`[MOCK EMAIL - TEAM INVITE]`);
    console.log(`To: ${recipientEmail}`);
    console.log(`Business: ${businessName}`);
    console.log(`Invited by: ${inviterName}`);
    console.log(`Invite URL: ${inviteUrl}`);
    console.log(`========================================\n`);
    return;
  }

  try {
    await transporter.sendMail(emailContent);
    console.log(`[EMAIL] Team invite sent to ${recipientEmail} for business ${businessName}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send invite to ${recipientEmail}:`, error);
    throw new Error("Failed to send invitation email");
  }
}
