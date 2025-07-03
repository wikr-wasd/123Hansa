// Professional email templates for 123hansa.se
// Critical for 1000+ customer communication

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface TemplateVariables {
  [key: string]: string | number;
}

export class EmailTemplateService {
  private static baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>{{subject}}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; padding: 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 16px 0; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
        .divider { border-top: 1px solid #e2e8f0; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">123hansa.se</div>
          <p style="margin: 0; opacity: 0.9;">Sveriges ledande affärsmarknadsplats</p>
        </div>
        <div class="content">
          {{content}}
        </div>
        <div class="footer">
          <p>Detta e-postmeddelande skickades från 123hansa.se</p>
          <p>
            <a href="{{unsubscribeUrl}}" style="color: #64748b;">Avregistrera</a> | 
            <a href="https://123hansa.se/privacy" style="color: #64748b;">Integritetspolicy</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Welcome email for new users
  static getWelcomeTemplate(variables: TemplateVariables): EmailTemplate {
    const content = `
      <h2>Välkommen till 123hansa.se, {{firstName}}!</h2>
      
      <p>Vi är glada att du har gått med i Sveriges ledande marknadsplats för företagsköp och crowdfunding.</p>
      
      <h3>Vad kan du göra härnäst?</h3>
      <ul>
        <li><strong>Utforska företag till salu</strong> - Bläddra bland hundratals verifierade affärsmöjligheter</li>
        <li><strong>Skapa din första annons</strong> - Sälj ditt eget företag med professionell support</li>
        <li><strong>Upptäck crowdfunding</strong> - Finansiera din affärsidé eller investera i andra</li>
        <li><strong>Kontakta experter</strong> - Få hjälp med värdering, juridik och finansiering</li>
      </ul>
      
      <a href="{{dashboardUrl}}" class="button">Kom igång nu</a>
      
      <div class="divider"></div>
      
      <p><strong>Behöver du hjälp?</strong></p>
      <p>Vårt supportteam finns här för dig. Kontakta oss på <a href="mailto:support@123hansa.se">support@123hansa.se</a> eller ring 08-123 456 78.</p>
    `;

    return {
      subject: 'Välkommen till 123hansa.se!',
      html: this.baseTemplate.replace('{{content}}', content).replace(/{{(\w+)}}/g, (match, key) => String(variables[key] || match)),
      text: this.stripHtml(content).replace(/{{(\w+)}}/g, (match, key) => String(variables[key] || match))
    };
  }

  // Email verification
  static getEmailVerificationTemplate(variables: TemplateVariables): EmailTemplate {
    const content = `
      <h2>Verifiera din e-postadress</h2>
      
      <p>Hej {{firstName}},</p>
      
      <p>För att slutföra din registrering på 123hansa.se behöver du verifiera din e-postadress.</p>
      
      <a href="{{verificationUrl}}" class="button">Verifiera e-post</a>
      
      <p>Länken är giltig i 24 timmar. Om du inte begärde detta konto kan du ignorera detta e-postmeddelande.</p>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #64748b;">
        Om knappen inte fungerar, kopiera och klistra in denna länk i din webbläsare:<br>
        {{verificationUrl}}
      </p>
    `;

    return {
      subject: 'Verifiera din e-postadress - 123hansa.se',
      html: this.baseTemplate.replace('{{content}}', content).replace(/{{(\w+)}}/g, (match, key) => String(variables[key] || match)),
      text: this.stripHtml(content).replace(/{{(\w+)}}/g, (match, key) => String(variables[key] || match))
    };
  }

  // Listing approved notification
  static getListingApprovedTemplate(variables: TemplateVariables): EmailTemplate {
    const content = `
      <h2>🎉 Din annons har godkänts!</h2>
      
      <p>Hej {{firstName}},</p>
      
      <p>Vi har granskat din annons "<strong>{{listingTitle}}</strong>" och den har nu publicerats på 123hansa.se.</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">{{listingTitle}}</h3>
        <p style="margin-bottom: 0;">Utropspris: {{askingPrice}} SEK</p>
      </div>
      
      <h3>Nästa steg:</h3>
      <ul>
        <li><strong>Svara snabbt på förfrågningar</strong> - Första intrycket räknas</li>
        <li><strong>Håll informationen uppdaterad</strong> - Ändra pris eller beskrivning när som helst</li>
        <li><strong>Överväg premium-funktioner</strong> - Gör din annons mer synlig</li>
      </ul>
      
      <a href="{{listingUrl}}" class="button">Se din annons</a>
      
      <div class="divider"></div>
      
      <p><strong>Tips för framgång:</strong></p>
      <p>Annonser med professionella bilder och detaljerade beskrivningar får 3x fler förfrågningar. Behöver du hjälp? Kontakta våra experter.</p>
    `;

    return {
      subject: 'Din annons har publicerats - 123hansa.se',
      html: this.baseTemplate.replace('{{content}}', content).replace(/{{(\w+)}}/g, (match, key) => String(variables[key] || match)),
      text: this.stripHtml(content).replace(/{{(\w+)}}/g, (match, key) => String(variables[key] || match))
    };
  }

  // New inquiry notification
  static getNewInquiryTemplate(variables: TemplateVariables): EmailTemplate {
    const content = `
      <h2>💼 Ny förfrågan om ditt företag</h2>
      
      <p>Hej {{firstName}},</p>
      
      <p>Du har fått en ny förfrågan om din annons "<strong>{{listingTitle}}</strong>".</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
        <p><strong>Från:</strong> {{inquirerName}}</p>
        <p><strong>E-post:</strong> {{inquirerEmail}}</p>
        <p><strong>Meddelande:</strong></p>
        <p style="font-style: italic;">"{{inquiryMessage}}"</p>
      </div>
      
      <a href="{{responseUrl}}" class="button">Svara på förfrågan</a>
      
      <div class="divider"></div>
      
      <p><strong>⏰ Snabba svar ökar dina chanser!</strong></p>
      <p>Köpare som får svar inom 2 timmar är 5x mer benägna att genomföra köp. Logga in nu för att svara.</p>
    `;

    return {
      subject: 'Ny förfrågan om ditt företag - 123hansa.se',
      html: this.baseTemplate.replace('{{content}}', content).replace(/{{(\w+)}}/g, (match, key) => String(variables[key] || match)),
      text: this.stripHtml(content).replace(/{{(\w+)}}/g, (match, key) => String(variables[key] || match))
    };
  }

  // Payment confirmation
  static getPaymentConfirmationTemplate(variables: TemplateVariables): EmailTemplate {
    const content = `
      <h2>✅ Betalning bekräftad</h2>
      
      <p>Hej {{firstName}},</p>
      
      <p>Vi har tagit emot din betalning. Här är detaljerna:</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: 500;">Tjänst:</td>
            <td style="padding: 8px 0;">{{serviceName}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500;">Belopp:</td>
            <td style="padding: 8px 0;">{{amount}} SEK</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500;">Betalningsmetod:</td>
            <td style="padding: 8px 0;">{{paymentMethod}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 500;">Transaktion-ID:</td>
            <td style="padding: 8px 0; font-family: monospace;">{{transactionId}}</td>
          </tr>
        </table>
      </div>
      
      <p>Din tjänst är nu aktiv och kommer vara synlig i {{duration}} dagar.</p>
      
      <a href="{{dashboardUrl}}" class="button">Se din dashboard</a>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #64748b;">
        Kvitto skickas separat för dina räkenskaper. Vid frågor, kontakta vårt supportteam.
      </p>
    `;

    return {
      subject: 'Betalning bekräftad - 123hansa.se',
      html: this.baseTemplate.replace('{{content}}', content).replace(/{{(\w+)}}/g, (match, key) => String(variables[key] || match)),
      text: this.stripHtml(content).replace(/{{(\w+)}}/g, (match, key) => String(variables[key] || match))
    };
  }

  // Weekly summary for active users
  static getWeeklySummaryTemplate(variables: TemplateVariables): EmailTemplate {
    const content = `
      <h2>📊 Din vecka på 123hansa.se</h2>
      
      <p>Hej {{firstName}},</p>
      
      <p>Här är en sammanfattning av aktiviteten på dina annonser denna vecka:</p>
      
      <div style="display: grid; gap: 16px; margin: 24px 0;">
        <div style="background: #f0f9ff; padding: 16px; border-radius: 8px;">
          <h4 style="margin: 0 0 8px 0; color: #1e40af;">👀 Visningar</h4>
          <p style="margin: 0; font-size: 24px; font-weight: bold;">{{totalViews}}</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">{{viewsChange}} från förra veckan</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 16px; border-radius: 8px;">
          <h4 style="margin: 0 0 8px 0; color: #166534;">💬 Förfrågningar</h4>
          <p style="margin: 0; font-size: 24px; font-weight: bold;">{{totalInquiries}}</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">{{inquiriesChange}} från förra veckan</p>
        </div>
      </div>
      
      <h3>🎯 Rekommendationer</h3>
      <ul>
        <li>{{recommendation1}}</li>
        <li>{{recommendation2}}</li>
        <li>{{recommendation3}}</li>
      </ul>
      
      <a href="{{dashboardUrl}}" class="button">Se fullständig statistik</a>
    `;

    return {
      subject: 'Din veckosammanfattning - 123hansa.se',
      html: this.baseTemplate.replace('{{content}}', content).replace(/{{(\w+)}}/g, (match, key) => String(variables[key] || match)),
      text: this.stripHtml(content).replace(/{{(\w+)}}/g, (match, key) => String(variables[key] || match))
    };
  }

  // Helper method to strip HTML for text version
  private static stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }
}

// Email queue for bulk sending (critical for 1000+ users)
export interface QueuedEmail {
  id: string;
  to: string;
  template: EmailTemplate;
  priority: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
  attempts: number;
  status: 'pending' | 'sent' | 'failed';
}

export class EmailQueueService {
  private static queue: QueuedEmail[] = [];

  static addToQueue(email: Omit<QueuedEmail, 'id' | 'attempts' | 'status'>): void {
    this.queue.push({
      ...email,
      id: Date.now().toString(),
      attempts: 0,
      status: 'pending'
    });
  }

  static getNextBatch(batchSize: number = 50): QueuedEmail[] {
    return this.queue
      .filter(email => email.status === 'pending')
      .sort((a, b) => {
        // Priority: high > normal > low
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, batchSize);
  }

  static markAsSent(emailId: string): void {
    const email = this.queue.find(e => e.id === emailId);
    if (email) {
      email.status = 'sent';
    }
  }

  static markAsFailed(emailId: string): void {
    const email = this.queue.find(e => e.id === emailId);
    if (email) {
      email.attempts++;
      email.status = email.attempts >= 3 ? 'failed' : 'pending';
    }
  }
}