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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #000000;">
        <div style="background: #E63946; padding: 40px 30px; text-align: center;">
          <div style="width: 60px; height: 60px; border-radius: 12px; background: rgba(255,255,255,0.1); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Team Invitation</h1>
        </div>

        <div style="background: #0a0a0a; padding: 40px 30px; color: rgba(255,255,255,0.8);">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hi there! 👋</p>

          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong style="color: #fff;">${inviterName}</strong> has invited you to join their business
            <strong style="color: #E63946;">${businessName}</strong> on Prodizzy.
          </p>

          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            As a team member, you'll be able to create campaigns, manage collaborations,
            and help grow the business together.
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${inviteUrl}"
               style="background: #E63946;
                      color: white;
                      padding: 16px 40px;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: bold;
                      display: inline-block;
                      font-size: 16px;">
              Accept Invitation
            </a>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; margin-top: 30px;">
            <p style="font-size: 13px; color: rgba(255,255,255,0.5); margin: 0 0 8px 0;">Or copy and paste this link:</p>
            <a href="${inviteUrl}" style="color: #E63946; word-break: break-all; font-size: 13px;">${inviteUrl}</a>
          </div>

          <p style="font-size: 13px; color: rgba(255,255,255,0.4); margin-top: 30px; text-align: center;">
            This invitation will expire in 7 days.
          </p>
        </div>

        <div style="text-align: center; padding: 30px; color: rgba(255,255,255,0.3); font-size: 12px; background: #000000;">
          <p style="margin: 0 0 8px 0;">If you didn't expect this invitation, you can safely ignore this email.</p>
          <p style="margin: 0; color: rgba(255,255,255,0.5);">— The Prodizzy Team</p>
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
