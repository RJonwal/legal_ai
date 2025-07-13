import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static fromEmail = process.env.FROM_EMAIL || "noreply@yourdomain.com";

  static async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      if (!resend) {
        console.warn("RESEND_API_KEY not configured, skipping email send");
        return false;
      }

      await resend.emails.send({
        from: template.from || this.fromEmail,
        to: template.to,
        subject: template.subject,
        html: template.html,
      });

      return true;
    } catch (error) {
      console.error("Email sending error:", error);
      return false;
    }
  }

  static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: email,
      subject: "Welcome to Legal Assistant Platform",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Legal Assistant Platform</h2>
          <p>Dear ${name},</p>
          <p>Thank you for joining our legal assistant platform. We're excited to help you streamline your legal workflows and enhance your practice.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Getting Started</h3>
            <ul>
              <li>Create your first case to begin organizing your legal matters</li>
              <li>Upload relevant documents to each case</li>
              <li>Use our AI assistant to generate legal documents and get insights</li>
              <li>Track important deadlines and events with our timeline feature</li>
            </ul>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>
          The Legal Assistant Team</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p>This email was sent from the Legal Assistant Platform. If you didn't create an account, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    return this.sendEmail(template);
  }

  static async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5000"}/reset-password?token=${resetToken}`;
    
    const template: EmailTemplate = {
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Password Reset Request</h2>
          <p>Dear ${name},</p>
          <p>We received a request to reset your password for your Legal Assistant Platform account.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0;"><strong>If you requested this reset:</strong></p>
            <p style="margin: 10px 0 0 0;">Click the button below to reset your password. This link will expire in 1 hour.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #64748b; font-size: 14px; word-break: break-all;">${resetUrl}</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #64748b;"><strong>If you didn't request this reset:</strong></p>
            <p style="margin: 10px 0 0 0; color: #64748b;">You can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          
          <p>Best regards,<br>
          The Legal Assistant Team</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p>This email was sent from the Legal Assistant Platform. For security reasons, this link will expire in 1 hour.</p>
          </div>
        </div>
      `,
    };

    return this.sendEmail(template);
  }

  static async sendPaymentSuccessEmail(email: string, name: string, amount: number, plan: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: email,
      subject: "Payment Successful - Subscription Activated",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Payment Successful</h2>
          <p>Dear ${name},</p>
          <p>Thank you for your payment. Your subscription has been successfully activated.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="color: #059669; margin-top: 0;">Subscription Details</h3>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
            <p><strong>Status:</strong> Active</p>
          </div>
          
          <p>You now have access to all premium features. Start exploring the enhanced capabilities of our platform.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5000"}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Access Dashboard</a>
          </div>
          
          <p>If you have any questions about your subscription or need assistance, please contact our support team.</p>
          
          <p>Best regards,<br>
          The Legal Assistant Team</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p>This email confirms your payment and subscription activation. Keep this email for your records.</p>
          </div>
        </div>
      `,
    };

    return this.sendEmail(template);
  }

  static async sendSubscriptionExpiredEmail(email: string, name: string): Promise<boolean> {
    const template: EmailTemplate = {
      to: email,
      subject: "Subscription Expired - Renew to Continue",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Subscription Expired</h2>
          <p>Dear ${name},</p>
          <p>Your Legal Assistant Platform subscription has expired. To continue using premium features, please renew your subscription.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #dc2626; margin-top: 0;">What happens next?</h3>
            <ul>
              <li>Your account remains active with basic features</li>
              <li>Premium features are temporarily disabled</li>
              <li>All your data and cases are preserved</li>
              <li>You can reactivate anytime by renewing</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5000"}/subscribe" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Renew Subscription</a>
          </div>
          
          <p>Thank you for using our platform. We hope to continue serving your legal needs.</p>
          
          <p>Best regards,<br>
          The Legal Assistant Team</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            <p>This email was sent to notify you about your subscription status. Your data remains secure and accessible.</p>
          </div>
        </div>
      `,
    };

    return this.sendEmail(template);
  }
}