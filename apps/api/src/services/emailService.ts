import nodemailer, { Transporter } from 'nodemailer';
import { config } from '@/config/app';
import { logger } from '@/utils/logger';

interface EmailData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.setupTransporter();
  }

  private setupTransporter() {
    if (config.nodeEnv === 'development') {
      // Use MailHog for development
      this.transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        secure: false,
        auth: undefined,
      });
    } else {
      // Production email configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  /**
   * Send email
   */
  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      const mailOptions = {
        from: config.emailFromAddress,
        to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
        attachments: data.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${data.to}`, { messageId: result.messageId });
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, firstName: string, verificationToken?: string): Promise<boolean> {
    const template = this.getWelcomeTemplate(firstName, verificationToken);
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(to: string, firstName: string, verificationToken: string): Promise<boolean> {
    const template = this.getEmailVerificationTemplate(firstName, verificationToken);
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, firstName: string, resetToken: string): Promise<boolean> {
    const template = this.getPasswordResetTemplate(firstName, resetToken);
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send message notification email
   */
  async sendMessageNotificationEmail(to: string, firstName: string, senderName: string, message: string, conversationLink: string): Promise<boolean> {
    const template = this.getMessageNotificationTemplate(firstName, senderName, message, conversationLink);
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  /**
   * Send listing inquiry notification
   */
  async sendListingInquiryEmail(to: string, ownerName: string, inquirerName: string, listingTitle: string, inquiryLink: string): Promise<boolean> {
    const template = this.getListingInquiryTemplate(ownerName, inquirerName, listingTitle, inquiryLink);
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Email Templates

  private getWelcomeTemplate(firstName: string, verificationToken?: string): EmailTemplate {
    const baseUrl = config.corsOrigins[0] || 'http://localhost:3000';
    const verificationLink = verificationToken ? `${baseUrl}/verify-email?token=${verificationToken}` : null;

    const subject = 'Välkommen till 123hansa - Nordens företagsmarknadsplats!';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Välkommen till 123hansa</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Välkommen till 123hansa!</h1>
                <p>Nordens ledande marknadsplats för företagsförsäljning</p>
            </div>
            <div class="content">
                <h2>Hej ${firstName}!</h2>
                <p>Tack för att du registrerade dig på 123hansa. Vi är glada att ha dig ombord!</p>
                
                <p>Med 123hansa kan du:</p>
                <ul>
                    <li>🏢 Sälja ditt företag säkert och enkelt</li>
                    <li>🔍 Hitta företag att köpa i hela Norden</li>
                    <li>💬 Kommunicera säkert med köpare och säljare</li>
                    <li>📊 Få professionell värdering och rådgivning</li>
                </ul>

                ${verificationLink ? `
                <p>För att komma igång, bekräfta din e-postadress genom att klicka på knappen nedan:</p>
                <p style="text-align: center;">
                    <a href="${verificationLink}" class="button">Bekräfta e-postadress</a>
                </p>
                ` : ''}

                <p>Om du har några frågor, tveka inte att kontakta oss på <a href="mailto:support@123hansa.se">support@123hansa.se</a></p>
                
                <p>Välkommen till framtiden för företagshandel!</p>
                <p><strong>123hansa-teamet</strong></p>
            </div>
            <div class="footer">
                <p>123hansa AB | Storgatan 1, 111 51 Stockholm | <a href="https://123hansa.se">123hansa.se</a></p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
    Välkommen till 123hansa, ${firstName}!

    Tack för att du registrerade dig på Nordens ledande marknadsplats för företagsförsäljning.

    Med 123hansa kan du:
    - Sälja ditt företag säkert och enkelt
    - Hitta företag att köpa i hela Norden
    - Kommunicera säkert med köpare och säljare
    - Få professionell värdering och rådgivning

    ${verificationToken ? `För att komma igång, bekräfta din e-postadress: ${verificationLink}` : ''}

    Har du frågor? Kontakta oss på support@123hansa.se

    Välkommen till framtiden för företagshandel!
    123hansa-teamet
    `;

    return { subject, html, text };
  }

  private getEmailVerificationTemplate(firstName: string, verificationToken: string): EmailTemplate {
    const baseUrl = config.corsOrigins[0] || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;

    const subject = 'Bekräfta din e-postadress - 123hansa';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Bekräfta din e-postadress</h1>
            </div>
            <div class="content">
                <h2>Hej ${firstName}!</h2>
                <p>För att slutföra din registrering på 123hansa, behöver vi bekräfta din e-postadress.</p>
                
                <p style="text-align: center;">
                    <a href="${verificationLink}" class="button">Bekräfta e-postadress</a>
                </p>
                
                <p>Om knappen inte fungerar, kopiera och klistra in denna länk i din webbläsare:</p>
                <p style="word-break: break-all; color: #666;">${verificationLink}</p>
                
                <p>Denna länk är giltig i 24 timmar.</p>
                
                <p>Om du inte registrerade dig på 123hansa, kan du ignorera detta e-postmeddelande.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
    Hej ${firstName}!

    För att slutföra din registrering på 123hansa, bekräfta din e-postadress genom att klicka på denna länk:
    ${verificationLink}

    Länken är giltig i 24 timmar.

    Om du inte registrerade dig på 123hansa, kan du ignorera detta meddelande.
    `;

    return { subject, html, text };
  }

  private getPasswordResetTemplate(firstName: string, resetToken: string): EmailTemplate {
    const baseUrl = config.corsOrigins[0] || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    const subject = 'Återställ ditt lösenord - 123hansa';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Återställ lösenord</h1>
            </div>
            <div class="content">
                <h2>Hej ${firstName}!</h2>
                <p>Du har begärt att återställa ditt lösenord för ditt 123hansa-konto.</p>
                
                <p style="text-align: center;">
                    <a href="${resetLink}" class="button">Återställ lösenord</a>
                </p>
                
                <p>Om knappen inte fungerar, kopiera och klistra in denna länk i din webbläsare:</p>
                <p style="word-break: break-all; color: #666;">${resetLink}</p>
                
                <p>Denna länk är giltig i 1 timme av säkerhetsskäl.</p>
                
                <p><strong>Om du inte begärde denna återställning, ignorera detta meddelande. Ditt lösenord förblir oförändrat.</strong></p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
    Hej ${firstName}!

    Du har begärt att återställa ditt lösenord för ditt 123hansa-konto.

    Klicka på denna länk för att återställa: ${resetLink}

    Länken är giltig i 1 timme.

    Om du inte begärde denna återställning, ignorera detta meddelande.
    `;

    return { subject, html, text };
  }

  private getMessageNotificationTemplate(firstName: string, senderName: string, message: string, conversationLink: string): EmailTemplate {
    const subject = `Nytt meddelande från ${senderName} - 123hansa`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .message-preview { background: #f8fafc; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; font-style: italic; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>💬 Nytt meddelande</h1>
            </div>
            <div class="content">
                <h2>Hej ${firstName}!</h2>
                <p>Du har fått ett nytt meddelande från <strong>${senderName}</strong>:</p>
                
                <div class="message-preview">
                    "${message}"
                </div>
                
                <p style="text-align: center;">
                    <a href="${conversationLink}" class="button">Läs och svara</a>
                </p>
                
                <p>Du kan också logga in på 123hansa för att läsa alla dina meddelanden.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
    Hej ${firstName}!

    Du har fått ett nytt meddelande från ${senderName}:

    "${message}"

    Läs och svara: ${conversationLink}
    `;

    return { subject, html, text };
  }

  private getListingInquiryTemplate(ownerName: string, inquirerName: string, listingTitle: string, inquiryLink: string): EmailTemplate {
    const subject = `Ny förfrågan om "${listingTitle}" - 123hansa`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #7c3aed; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
            .highlight { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔔 Ny förfrågan</h1>
            </div>
            <div class="content">
                <h2>Hej ${ownerName}!</h2>
                <p>Du har fått en ny förfrågan om ditt företag på 123hansa!</p>
                
                <div class="highlight">
                    <strong>${inquirerName}</strong> har skickat en förfrågan om:<br>
                    <strong>"${listingTitle}"</strong>
                </div>
                
                <p>Detta är ett tecken på att din annons väcker intresse. Svara snabbt för att hålla dialogen igång!</p>
                
                <p style="text-align: center;">
                    <a href="${inquiryLink}" class="button">Läs förfrågan</a>
                </p>
                
                <p><strong>Tips:</strong> Snabba svar ökar chanserna för en lyckad försäljning!</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const text = `
    Hej ${ownerName}!

    Du har fått en ny förfrågan om ditt företag på 123hansa!

    ${inquirerName} har skickat en förfrågan om: "${listingTitle}"

    Läs förfrågan: ${inquiryLink}

    Tips: Snabba svar ökar chanserna för en lyckad försäljning!
    `;

    return { subject, html, text };
  }
}

export const emailService = new EmailService();