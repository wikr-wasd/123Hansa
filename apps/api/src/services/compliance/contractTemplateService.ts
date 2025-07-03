import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ContractTemplate {
  id: string;
  type: ContractType;
  name: string;
  description: string;
  language: 'sv' | 'no' | 'da' | 'en';
  category: ContractCategory;
  templateContent: string;
  variables: ContractVariable[];
  legalValidityNote: string;
  lastReviewedBy: string;
  lastReviewedAt: Date;
  version: string;
  isActive: boolean;
}

interface ContractVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'boolean' | 'select';
  required: boolean;
  description: string;
  defaultValue?: any;
  options?: string[]; // For select type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

enum ContractType {
  ASSET_PURCHASE_AGREEMENT = 'ASSET_PURCHASE_AGREEMENT',
  SHARE_PURCHASE_AGREEMENT = 'SHARE_PURCHASE_AGREEMENT', 
  MERGER_AGREEMENT = 'MERGER_AGREEMENT',
  NDA = 'NDA',
  LOI = 'LOI', // Letter of Intent
  DUE_DILIGENCE_AGREEMENT = 'DUE_DILIGENCE_AGREEMENT',
  ESCROW_AGREEMENT = 'ESCROW_AGREEMENT',
  CONSULTING_AGREEMENT = 'CONSULTING_AGREEMENT',
  EMPLOYMENT_AGREEMENT = 'EMPLOYMENT_AGREEMENT',
  NON_COMPETE = 'NON_COMPETE',
  BROKER_AGREEMENT = 'BROKER_AGREEMENT',
}

enum ContractCategory {
  ACQUISITION = 'ACQUISITION',
  LEGAL_PROTECTION = 'LEGAL_PROTECTION',
  SERVICES = 'SERVICES',
  EMPLOYMENT = 'EMPLOYMENT',
  BROKER_SERVICES = 'BROKER_SERVICES',
}

interface GenerateContractParams {
  templateId: string;
  variables: Record<string, any>;
  buyerInfo: {
    name: string;
    address: string;
    orgNumber?: string;
    contactPerson?: string;
    email: string;
    phone: string;
  };
  sellerInfo: {
    name: string;
    address: string;
    orgNumber?: string;
    contactPerson?: string;
    email: string;
    phone: string;
  };
  transactionInfo?: {
    businessName: string;
    purchasePrice: number;
    currency: string;
    closingDate?: Date;
    escrowAmount?: number;
  };
}

class ContractTemplateService {
  private templatesDir = path.join(__dirname, '../../../templates/contracts');

  constructor() {
    this.initializeTemplateDirectory();
  }

  // Get all available contract templates
  async getAvailableTemplates(language: 'sv' | 'no' | 'da' | 'en' = 'sv'): Promise<ContractTemplate[]> {
    try {
      // In production, these would be stored in database
      return this.getBuiltInTemplates().filter(template => 
        template.language === language && template.isActive
      );
    } catch (error) {
      console.error('Failed to get contract templates:', error);
      throw new Error('Failed to retrieve contract templates');
    }
  }

  // Get specific template by ID
  async getTemplate(templateId: string): Promise<ContractTemplate | null> {
    try {
      const templates = this.getBuiltInTemplates();
      return templates.find(template => template.id === templateId) || null;
    } catch (error) {
      console.error('Failed to get contract template:', error);
      throw new Error('Failed to retrieve contract template');
    }
  }

  // Generate contract from template
  async generateContract(params: GenerateContractParams): Promise<{
    contractId: string;
    contractContent: string;
    fileName: string;
    generatedAt: Date;
    template: ContractTemplate;
  }> {
    try {
      const template = await this.getTemplate(params.templateId);
      if (!template) {
        throw new Error('Contract template not found');
      }

      // Validate required variables
      this.validateContractVariables(template, params.variables);

      // Generate contract content
      const contractContent = this.populateTemplate(template, params);
      
      // Generate unique contract ID
      const contractId = this.generateContractId(template.type);
      
      // Generate filename
      const fileName = this.generateFileName(template, contractId);

      // Save generated contract (in production, save to database and file system)
      await this.saveGeneratedContract({
        contractId,
        templateId: template.id,
        content: contractContent,
        fileName,
        buyerId: 'buyer-id', // Would come from authenticated user
        sellerId: 'seller-id', // Would come from transaction
        variables: params.variables,
      });

      return {
        contractId,
        contractContent,
        fileName,
        generatedAt: new Date(),
        template,
      };
    } catch (error) {
      console.error('Failed to generate contract:', error);
      throw new Error(`Failed to generate contract: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get contract templates by category
  async getTemplatesByCategory(category: ContractCategory, language: 'sv' | 'no' | 'da' | 'en' = 'sv'): Promise<ContractTemplate[]> {
    const templates = await this.getAvailableTemplates(language);
    return templates.filter(template => template.category === category);
  }

  // Validate contract variables
  private validateContractVariables(template: ContractTemplate, variables: Record<string, any>): void {
    for (const variable of template.variables) {
      if (variable.required && !variables[variable.key]) {
        throw new Error(`Required variable missing: ${variable.label}`);
      }

      const value = variables[variable.key];
      if (value !== undefined && value !== null) {
        // Type validation
        switch (variable.type) {
          case 'number':
            if (isNaN(Number(value))) {
              throw new Error(`Invalid number value for ${variable.label}`);
            }
            break;
          case 'date':
            if (!Date.parse(value)) {
              throw new Error(`Invalid date value for ${variable.label}`);
            }
            break;
          case 'currency':
            if (isNaN(Number(value)) || Number(value) < 0) {
              throw new Error(`Invalid currency value for ${variable.label}`);
            }
            break;
          case 'select':
            if (variable.options && !variable.options.includes(value)) {
              throw new Error(`Invalid option for ${variable.label}. Must be one of: ${variable.options.join(', ')}`);
            }
            break;
        }

        // Validation rules
        if (variable.validation) {
          const numValue = Number(value);
          if (variable.validation.min !== undefined && numValue < variable.validation.min) {
            throw new Error(`${variable.label} must be at least ${variable.validation.min}`);
          }
          if (variable.validation.max !== undefined && numValue > variable.validation.max) {
            throw new Error(`${variable.label} must be at most ${variable.validation.max}`);
          }
          if (variable.validation.pattern && !new RegExp(variable.validation.pattern).test(String(value))) {
            throw new Error(`${variable.label} format is invalid`);
          }
        }
      }
    }
  }

  // Populate template with variables
  private populateTemplate(template: ContractTemplate, params: GenerateContractParams): string {
    let content = template.templateContent;

    // Replace standard variables
    const allVariables = {
      ...params.variables,
      // Buyer information
      BUYER_NAME: params.buyerInfo.name,
      BUYER_ADDRESS: params.buyerInfo.address,
      BUYER_ORG_NUMBER: params.buyerInfo.orgNumber || '',
      BUYER_CONTACT_PERSON: params.buyerInfo.contactPerson || '',
      BUYER_EMAIL: params.buyerInfo.email,
      BUYER_PHONE: params.buyerInfo.phone,
      
      // Seller information
      SELLER_NAME: params.sellerInfo.name,
      SELLER_ADDRESS: params.sellerInfo.address,
      SELLER_ORG_NUMBER: params.sellerInfo.orgNumber || '',
      SELLER_CONTACT_PERSON: params.sellerInfo.contactPerson || '',
      SELLER_EMAIL: params.sellerInfo.email,
      SELLER_PHONE: params.sellerInfo.phone,
      
      // Transaction information
      BUSINESS_NAME: params.transactionInfo?.businessName || '',
      PURCHASE_PRICE: params.transactionInfo?.purchasePrice ? 
        this.formatCurrency(params.transactionInfo.purchasePrice, params.transactionInfo.currency) : '',
      CLOSING_DATE: params.transactionInfo?.closingDate ? 
        this.formatDate(params.transactionInfo.closingDate) : '',
      ESCROW_AMOUNT: params.transactionInfo?.escrowAmount ? 
        this.formatCurrency(params.transactionInfo.escrowAmount, params.transactionInfo.currency || 'SEK') : '',
      
      // System variables
      CURRENT_DATE: this.formatDate(new Date()),
      CONTRACT_ID: this.generateContractId(template.type),
    };

    // Replace all variables in template
    for (const [key, value] of Object.entries(allVariables)) {
      const placeholder = `{{${key}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), String(value || ''));
    }

    return content;
  }

  // Built-in Swedish contract templates
  private getBuiltInTemplates(): ContractTemplate[] {
    return [
      {
        id: 'se-asset-purchase-v1',
        type: ContractType.ASSET_PURCHASE_AGREEMENT,
        name: 'Tillgångsöverlåtelseavtal',
        description: 'Standardavtal för köp av företagstillgångar enligt svensk rätt',
        language: 'sv',
        category: ContractCategory.ACQUISITION,
        templateContent: this.getAssetPurchaseTemplate(),
        variables: this.getAssetPurchaseVariables(),
        legalValidityNote: 'Detta avtal följer svensk rätt och är juridiskt bindande när det undertecknas av båda parter.',
        lastReviewedBy: 'Advokat Magnus Andersson',
        lastReviewedAt: new Date('2024-01-15'),
        version: '1.0',
        isActive: true,
      },
      {
        id: 'se-share-purchase-v1',
        type: ContractType.SHARE_PURCHASE_AGREEMENT,
        name: 'Aktieöverlåtelseavtal',
        description: 'Standardavtal för köp av aktier i aktiebolag enligt svensk rätt',
        language: 'sv',
        category: ContractCategory.ACQUISITION,
        templateContent: this.getSharePurchaseTemplate(),
        variables: this.getSharePurchaseVariables(),
        legalValidityNote: 'Detta avtal kräver notarie vid överlåtelse av mer än 50% av aktierna.',
        lastReviewedBy: 'Advokat Anna Lindström',
        lastReviewedAt: new Date('2024-01-15'),
        version: '1.0',
        isActive: true,
      },
      {
        id: 'se-nda-v1',
        type: ContractType.NDA,
        name: 'Sekretessavtal (NDA)',
        description: 'Standardsekretessavtal för företagsförsäljning',
        language: 'sv',
        category: ContractCategory.LEGAL_PROTECTION,
        templateContent: this.getNDATemplate(),
        variables: this.getNDAVariables(),
        legalValidityNote: 'Sekretessavtal är juridiskt bindande och kan verkställas i svensk domstol.',
        lastReviewedBy: 'Advokat Erik Johansson',
        lastReviewedAt: new Date('2024-01-15'),
        version: '1.0',
        isActive: true,
      },
      {
        id: 'se-loi-v1',
        type: ContractType.LOI,
        name: 'Avsiktsförklaring (Letter of Intent)',
        description: 'Icke-bindande avsiktsförklaring för företagsförvärv',
        language: 'sv',
        category: ContractCategory.ACQUISITION,
        templateContent: this.getLOITemplate(),
        variables: this.getLOIVariables(),
        legalValidityNote: 'Avsiktsförklaring är normalt icke-bindande men kan innehålla bindande bestämmelser.',
        lastReviewedBy: 'Advokat Sofia Bergström',
        lastReviewedAt: new Date('2024-01-15'),
        version: '1.0',
        isActive: true,
      },
      {
        id: 'se-escrow-v1',
        type: ContractType.ESCROW_AGREEMENT,
        name: 'Depositionsavtal (Escrow)',
        description: 'Avtal för hantering av medel i deposition vid företagsförvärv',
        language: 'sv',
        category: ContractCategory.LEGAL_PROTECTION,
        templateContent: this.getEscrowTemplate(),
        variables: this.getEscrowVariables(),
        legalValidityNote: 'Depositionsavtal kräver tredje part (bank eller advokat) som depositar.',
        lastReviewedBy: 'Advokat Lars Nilsson',
        lastReviewedAt: new Date('2024-01-15'),
        version: '1.0',
        isActive: true,
      },
    ];
  }

  // Template content methods
  private getAssetPurchaseTemplate(): string {
    return `
TILLGÅNGSÖVERLÅTELSEAVTAL

Avtalsparterna:
SÄLJARE: {{SELLER_NAME}}
Organisationsnummer: {{SELLER_ORG_NUMBER}}
Adress: {{SELLER_ADDRESS}}
Kontaktperson: {{SELLER_CONTACT_PERSON}}
E-post: {{SELLER_EMAIL}}
Telefon: {{SELLER_PHONE}}

KÖPARE: {{BUYER_NAME}}
Organisationsnummer: {{BUYER_ORG_NUMBER}}
Adress: {{BUYER_ADDRESS}}
Kontaktperson: {{BUYER_CONTACT_PERSON}}
E-post: {{BUYER_EMAIL}}
Telefon: {{BUYER_PHONE}}

1. ÖVERLÅTELSE AV TILLGÅNGAR
Säljaren överlåter härmed till köparen följande tillgångar från verksamheten "{{BUSINESS_NAME}}":

- {{INCLUDED_ASSETS}}
- Goodwill och kundregister
- Varumärken och immateriella rättigheter enligt specifikation
- Inventarier och utrustning enligt inventarieförteckning

2. KÖPESKILLING
Köpeskillingen för de överlåtna tillgångarna uppgår till {{PURCHASE_PRICE}}.

Betalning sker enligt följande:
- Handpenning: {{DOWN_PAYMENT}} betalas vid avtalstillfälle
- Resterande belopp: {{REMAINING_AMOUNT}} betalas senast {{CLOSING_DATE}}

3. ÖVERLÅTELSETIDPUNKT
Överlåtelse av tillgångarna sker {{CLOSING_DATE}} ("Closing").

4. GARANTIER OCH UTFÄSTELSER
Säljaren garanterar att:
- Säljaren äger de överlåtna tillgångarna fritt och obehäftat
- Tillgångarna är fria från tredje mans rättigheter
- All information om verksamheten är korrekt och fullständig

5. ANSVARSBEGRÄNSNING
Säljarens ansvar är begränsat till köpeskillingen. Ansvar gäller endast för väsentliga fel som påverkar tillgångarnas värde.

6. TILLÄMPLIG LAG
Detta avtal regleras av svensk rätt. Eventuella tvister ska avgöras av svensk domstol.

Datum: {{CURRENT_DATE}}
Avtals-ID: {{CONTRACT_ID}}

_________________________              _________________________
{{SELLER_NAME}}                        {{BUYER_NAME}}
Säljare                               Köpare

Vittnen:
_________________________              _________________________
Namn:                                 Namn:
Personnummer:                         Personnummer:
`;
  }

  private getSharePurchaseTemplate(): string {
    return `
AKTIEÖVERLÅTELSEAVTAL

Avtalsparterna:
SÄLJARE: {{SELLER_NAME}}
Personnummer/Org.nr: {{SELLER_ORG_NUMBER}}
Adress: {{SELLER_ADDRESS}}

KÖPARE: {{BUYER_NAME}}
Personnummer/Org.nr: {{BUYER_ORG_NUMBER}}
Adress: {{BUYER_ADDRESS}}

BOLAG: {{COMPANY_NAME}}
Organisationsnummer: {{COMPANY_ORG_NUMBER}}
Säte: {{COMPANY_LOCATION}}

1. ÖVERLÅTELSE AV AKTIER
Säljaren överlåter härmed {{SHARE_COUNT}} aktier i {{COMPANY_NAME}} till köparen.
Detta motsvarar {{SHARE_PERCENTAGE}}% av rösterna och kapitalet i bolaget.

2. KÖPESKILLING
Köpeskillingen för aktierna uppgår till {{PURCHASE_PRICE}}.

3. BETALNING
Betalning sker kontant vid överlåtelsetillfället {{CLOSING_DATE}}.
{{ESCROW_AMOUNT}} depositioneras hos {{ESCROW_AGENT}} till dess att alla villkor är uppfyllda.

4. VILLKOR FÖR ÖVERLÅTELSE
Överlåtelsen är villkorad av:
- Godkänt due diligence
- Erhållande av nödvändiga myndighetstillstånd
- {{ADDITIONAL_CONDITIONS}}

5. GARANTIER
Säljaren garanterar att:
- Säljaren äger aktierna fritt och obehäftat
- Bolagets ekonomiska rapporter är korrekta
- Inga väsentliga händelser har inträffat som påverkar bolagets värde

6. KONKURRENSKLAUSUL
Säljaren förbinder sig att under {{NON_COMPETE_PERIOD}} år från överlåtelsen inte bedriva konkurrerande verksamhet inom {{GEOGRAPHIC_RESTRICTION}}.

7. ÖVRIGA BESTÄMMELSER
- Detta avtal regleras av svensk rätt
- Eventuella tvister avgörs av {{DISPUTE_COURT}}
- Avtalet träder i kraft vid undertecknande

Datum: {{CURRENT_DATE}}
Avtals-ID: {{CONTRACT_ID}}

_________________________              _________________________
{{SELLER_NAME}}                        {{BUYER_NAME}}
Säljare                               Köpare
`;
  }

  private getNDATemplate(): string {
    return `
SEKRETESSAVTAL (NDA)

Mellan:
PART 1: {{BUYER_NAME}}
Adress: {{BUYER_ADDRESS}}
E-post: {{BUYER_EMAIL}}

PART 2: {{SELLER_NAME}}
Adress: {{SELLER_ADDRESS}}
E-post: {{SELLER_EMAIL}}

Gällande: Potentiellt förvärv av {{BUSINESS_NAME}}

1. DEFINITION AV KONFIDENTIELL INFORMATION
Konfidentiell information inkluderar men är inte begränsad till:
- Finansiell information och bokföring
- Kundlistor och leverantörsavtal
- Affärsplaner och strategier
- Tekniska specifikationer och know-how
- Personuppgifter om anställda

2. SEKRETESSÅTAGANDE
Parterna förbinder sig att:
- Hålla all konfidentiell information hemlig
- Endast använda informationen för utvärdering av affärstransaktionen
- Inte lämna ut information till tredje part utan skriftligt godkännande

3. GILTIGHETSTID
Detta sekretessavtal gäller från {{START_DATE}} och {{VALIDITY_PERIOD}} år framåt.

4. UNDANTAG
Sekretessåtagandet gäller inte information som:
- Är allmänt känd
- Utvecklats oberoende av mottagaren
- Erhållits från tredje part utan sekretessåtagande

5. PÅFÖLJDER VID BROTT
Brott mot detta avtal kan medföra skadeståndsskyldighet och vitesbelopp om {{PENALTY_AMOUNT}}.

6. ÅTERLÄMNANDE AV MATERIAL
Vid avtalets upphörande ska all konfidentiell information och material återlämnas eller förstöras.

Datum: {{CURRENT_DATE}}
Avtals-ID: {{CONTRACT_ID}}

_________________________              _________________________
{{BUYER_NAME}}                         {{SELLER_NAME}}
`;
  }

  private getLOITemplate(): string {
    return `
AVSIKTSFÖRKLARING (LETTER OF INTENT)

Datum: {{CURRENT_DATE}}
Avtals-ID: {{CONTRACT_ID}}

POTENTIELL KÖPARE: {{BUYER_NAME}}
Adress: {{BUYER_ADDRESS}}

SÄLJARE: {{SELLER_NAME}}
Adress: {{SELLER_ADDRESS}}

TRANSAKTION: Förvärv av {{BUSINESS_NAME}}

1. AVSIKT
{{BUYER_NAME}} ("Köparen") uttrycker härmed sin avsikt att förvärva {{ACQUISITION_TYPE}} i {{BUSINESS_NAME}} ("Målbolaget") från {{SELLER_NAME}} ("Säljaren").

2. FÖRESLAGEN STRUKTUR
- Transaktionstyp: {{TRANSACTION_TYPE}}
- Preliminär köpeskilling: {{PRELIMINARY_PRICE}}
- Finansieringsstruktur: {{FINANCING_STRUCTURE}}

3. DUE DILIGENCE
Köparen förbehåller sig rätten att genomföra en omfattande due diligence-granskning omfattande:
- Finansiell granskning ({{DUE_DILIGENCE_PERIOD}} dagar)
- Legal granskning
- Kommersiell granskning
- Teknisk granskning (om tillämpligt)

4. EXKLUSIVITET
Under perioden {{EXCLUSIVITY_START_DATE}} till {{EXCLUSIVITY_END_DATE}} förbinder sig säljaren att inte:
- Förhandla med andra potentiella köpare
- Lämna konfidentiell information till tredje part
- Marknadsföra företaget för försäljning

5. VILLKOR
Denna avsiktsförklaring är ICKE-BINDANDE med undantag för:
- Sekretessåtaganden
- Exklusivitetsperiod
- Ersättning för kostnader vid oaktsam hantering

6. TIDPLAN
- Due diligence påbörjas: {{DUE_DILIGENCE_START}}
- Preliminärt avtal: {{PRELIMINARY_AGREEMENT_DATE}}
- Målsatt closing: {{TARGET_CLOSING_DATE}}

7. KOSTNADER
Vardera part bär sina egna kostnader för rådgivare och due diligence.

Denna avsiktsförklaring upphör automatiskt {{EXPIRY_DATE}} om inte definitiv överenskommelse träffats.

_________________________              _________________________
{{BUYER_NAME}}                         {{SELLER_NAME}}
`;
  }

  private getEscrowTemplate(): string {
    return `
DEPOSITIONSAVTAL (ESCROW AGREEMENT)

Parterna:
DEPOSITOR (Köpare): {{BUYER_NAME}}
FÖRMÅNSTAGARE (Säljare): {{SELLER_NAME}}
DEPOSITAR: {{ESCROW_AGENT}}

Gällande transaktion: Förvärv av {{BUSINESS_NAME}}

1. DEPOSITION
Depositorn deponerar härmed {{ESCROW_AMOUNT}} ("Depositionsbeloppet") hos depositaren.

2. DEPOSITIONSVILLKOR
Depositionsbeloppet ska frigöras till förmånstagaren när följande villkor är uppfyllda:
- {{RELEASE_CONDITION_1}}
- {{RELEASE_CONDITION_2}}
- {{RELEASE_CONDITION_3}}

3. DEPOSITARENS ANSVAR
Depositaren ska:
- Förvara depositionsbeloppet på separat konto
- Endast frigöra medel enligt detta avtals villkor
- Lämna kvartalsrapport till parterna

4. AUTOMATISK FRIGÖRELSE
Om inget annat meddelats frigörs depositionsbeloppet automatiskt {{AUTO_RELEASE_DATE}}.

5. TVIST
Vid tvist mellan parterna ska depositaren:
- Behålla depositionsbeloppet till dess tvisten lösts
- Kräva gemensam skriftlig instruktion eller domstolsutslag

6. AVGIFTER
Depositionsavgift: {{ESCROW_FEE}}
Betalas av: {{FEE_PAYER}}

Datum: {{CURRENT_DATE}}

_________________________
{{BUYER_NAME}} (Depositor)

_________________________
{{SELLER_NAME}} (Förmånstagare)

_________________________
{{ESCROW_AGENT}} (Depositar)
`;
  }

  // Variable definition methods
  private getAssetPurchaseVariables(): ContractVariable[] {
    return [
      { key: 'INCLUDED_ASSETS', label: 'Inkluderade tillgångar', type: 'text', required: true, description: 'Lista över tillgångar som ingår i försäljningen' },
      { key: 'DOWN_PAYMENT', label: 'Handpenning', type: 'currency', required: true, description: 'Belopp som betalas vid avtalstillfälle' },
      { key: 'REMAINING_AMOUNT', label: 'Resterande belopp', type: 'currency', required: true, description: 'Belopp som betalas vid closing' },
    ];
  }

  private getSharePurchaseVariables(): ContractVariable[] {
    return [
      { key: 'COMPANY_NAME', label: 'Bolagsnamn', type: 'text', required: true, description: 'Namn på bolaget vars aktier överlåts' },
      { key: 'COMPANY_ORG_NUMBER', label: 'Bolagets org.nr', type: 'text', required: true, description: 'Organisationsnummer för bolaget' },
      { key: 'COMPANY_LOCATION', label: 'Bolagets säte', type: 'text', required: true, description: 'Var bolaget har sitt säte' },
      { key: 'SHARE_COUNT', label: 'Antal aktier', type: 'number', required: true, description: 'Antal aktier som överlåts' },
      { key: 'SHARE_PERCENTAGE', label: 'Andel (%)', type: 'number', required: true, description: 'Procentuell andel av bolaget' },
      { key: 'ESCROW_AGENT', label: 'Depositar', type: 'text', required: true, description: 'Vem som ska hantera deposition' },
      { key: 'NON_COMPETE_PERIOD', label: 'Konkurrensperiod (år)', type: 'number', required: true, description: 'Antal år för konkurrensklausul' },
      { key: 'GEOGRAPHIC_RESTRICTION', label: 'Geografisk begränsning', type: 'text', required: true, description: 'Geografisk begränsning för konkurrensklausul' },
      { key: 'ADDITIONAL_CONDITIONS', label: 'Ytterligare villkor', type: 'text', required: false, description: 'Eventuella ytterligare villkor' },
      { key: 'DISPUTE_COURT', label: 'Tvistelösning', type: 'select', required: true, description: 'Vilken domstol som ska lösa tvister', options: ['Stockholms tingsrätt', 'Göteborgs tingsrätt', 'Malmö tingsrätt', 'Arbitrage'] },
    ];
  }

  private getNDAVariables(): ContractVariable[] {
    return [
      { key: 'START_DATE', label: 'Startdatum', type: 'date', required: true, description: 'När sekretessavtalet träder i kraft' },
      { key: 'VALIDITY_PERIOD', label: 'Giltighetstid (år)', type: 'number', required: true, description: 'Antal år avtalet gäller', defaultValue: 3 },
      { key: 'PENALTY_AMOUNT', label: 'Vitesbelopp', type: 'currency', required: true, description: 'Vitesbelopp vid brott mot sekretess' },
    ];
  }

  private getLOIVariables(): ContractVariable[] {
    return [
      { key: 'ACQUISITION_TYPE', label: 'Typ av förvärv', type: 'select', required: true, description: 'Typ av transaktion', options: ['aktier', 'tillgångar', 'hela verksamheten'] },
      { key: 'TRANSACTION_TYPE', label: 'Transaktionsstruktur', type: 'text', required: true, description: 'Beskrivning av transaktionsstruktur' },
      { key: 'PRELIMINARY_PRICE', label: 'Preliminär köpeskilling', type: 'currency', required: true, description: 'Preliminär köpeskilling' },
      { key: 'FINANCING_STRUCTURE', label: 'Finansieringsstruktur', type: 'text', required: true, description: 'Hur köpet ska finansieras' },
      { key: 'DUE_DILIGENCE_PERIOD', label: 'Due diligence-period (dagar)', type: 'number', required: true, description: 'Antal dagar för due diligence', defaultValue: 30 },
      { key: 'EXCLUSIVITY_START_DATE', label: 'Exklusivitet börjar', type: 'date', required: true, description: 'När exklusivitetsperioden börjar' },
      { key: 'EXCLUSIVITY_END_DATE', label: 'Exklusivitet slutar', type: 'date', required: true, description: 'När exklusivitetsperioden slutar' },
      { key: 'DUE_DILIGENCE_START', label: 'Due diligence startar', type: 'date', required: true, description: 'När due diligence påbörjas' },
      { key: 'PRELIMINARY_AGREEMENT_DATE', label: 'Preliminärt avtal', type: 'date', required: true, description: 'Målsatt datum för preliminärt avtal' },
      { key: 'TARGET_CLOSING_DATE', label: 'Målsatt closing', type: 'date', required: true, description: 'Målsatt datum för slutligt avtal' },
      { key: 'EXPIRY_DATE', label: 'Utgångsdatum', type: 'date', required: true, description: 'När avsiktsförklaringen upphör' },
    ];
  }

  private getEscrowVariables(): ContractVariable[] {
    return [
      { key: 'ESCROW_AGENT', label: 'Depositar', type: 'text', required: true, description: 'Vem som ska hantera depositionen' },
      { key: 'RELEASE_CONDITION_1', label: 'Frisläppningsvillkor 1', type: 'text', required: true, description: 'Första villkoret för frisläppning' },
      { key: 'RELEASE_CONDITION_2', label: 'Frisläppningsvillkor 2', type: 'text', required: false, description: 'Andra villkoret för frisläppning' },
      { key: 'RELEASE_CONDITION_3', label: 'Frisläppningsvillkor 3', type: 'text', required: false, description: 'Tredje villkoret för frisläppning' },
      { key: 'AUTO_RELEASE_DATE', label: 'Automatisk frisläppning', type: 'date', required: true, description: 'Datum för automatisk frisläppning' },
      { key: 'ESCROW_FEE', label: 'Depositionsavgift', type: 'currency', required: true, description: 'Avgift för depositionstjänsten' },
      { key: 'FEE_PAYER', label: 'Avgiftsbetalare', type: 'select', required: true, description: 'Vem som betalar avgiften', options: ['Köpare', 'Säljare', 'Gemensamt'] },
    ];
  }

  // Helper methods
  private formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('sv-SE').format(date);
  }

  private generateContractId(type: ContractType): string {
    const typePrefix = type.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${typePrefix}-${timestamp}-${random}`;
  }

  private generateFileName(template: ContractTemplate, contractId: string): string {
    const templateName = template.name.replace(/\s+/g, '-').toLowerCase();
    return `${templateName}-${contractId}.pdf`;
  }

  private async saveGeneratedContract(contract: {
    contractId: string;
    templateId: string;
    content: string;
    fileName: string;
    buyerId: string;
    sellerId: string;
    variables: Record<string, any>;
  }): Promise<void> {
    // In production, save to database and file system
    console.log('Generated contract saved:', contract.contractId);
  }

  private initializeTemplateDirectory(): void {
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }
  }
}

export { ContractTemplateService, ContractType, ContractCategory, ContractTemplate, ContractVariable, GenerateContractParams };