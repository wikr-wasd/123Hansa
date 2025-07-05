# 123Hansa Legal & Regulatory Compliance System Setup Guide

## Översikt
Komplett guide för 123Hansas juridiska efterlevnad och regelefterlevnad (Session 8).

## Vad som implementerats

### 1. GDPR Compliance System (`/src/services/compliance/gdprService.ts`)

#### Funktioner ✅
- **Data Export** - GDPR Artikel 20 (Rätt till dataportabilitet)
  - JSON, XML, CSV format support
  - Komplett användardata export
  - Säker nedladdning med 30-dagars giltighetstid
  - Automatisk anonymisering av känslig data

- **Data Deletion** - GDPR Artikel 17 (Rätt till radering)
  - Soft deletion (anonymisering)
  - Hard deletion (permanent borttagning)
  - Intelligent datalagring för lagkrav
  - Audit trail för alla raderingar

- **Consent Management** - GDPR Artikel 6-7
  - Granular consent per databehandling
  - IP och User-Agent spårning
  - Historisk consent loggning
  - Enkelt återkallande av samtycke

- **Data Processing Transparency**
  - Fullständig information om databehandling
  - Rättslig grund för varje användning
  - Kontaktinformation till DPO
  - Tillsynsmyndighet information

#### API Endpoints
```
POST   /api/compliance/gdpr/export          # Begär dataexport
GET    /api/compliance/gdpr/exports/:id     # Ladda ner export
POST   /api/compliance/gdpr/delete          # Begär dataradering
POST   /api/compliance/consent              # Uppdatera samtycke
GET    /api/compliance/consent              # Hämta samtycken
GET    /api/compliance/data-processing-info # Offentlig info om databehandling
```

### 2. Contract Template System (`/src/services/compliance/contractTemplateService.ts`)

#### Svenska Avtalsmallar ✅
- **Tillgångsöverlåtelseavtal** - För köp av företagstillgångar
- **Aktieöverlåtelseavtal** - För köp av aktier i aktiebolag  
- **Sekretessavtal (NDA)** - För konfidentiell information
- **Avsiktsförklaring (LOI)** - Icke-bindande förhandlingsavtal
- **Depositionsavtal (Escrow)** - För säker fondhantering

#### Funktioner
- **Dynamic Variable Replacement** - Automatisk ifyllning av avtalsdata
- **Legal Validation** - Kontroll av obligatoriska fält
- **Multi-format Export** - PDF, Word, HTML output
- **Version Control** - Spårning av avtalsversioner
- **Legal Review Status** - Senast granskad av jurist

#### Variable System
```typescript
interface ContractVariable {
  key: string;
  label: string; 
  type: 'text' | 'number' | 'date' | 'currency' | 'boolean' | 'select';
  required: boolean;
  validation?: ValidationRules;
}
```

### 3. KYC/AML Verification System (`/src/services/compliance/kycAmlService.ts`)

#### Verifieringstyper ✅
- **Document Verification** - ID-handlingar (pass, körkort)
- **BankID Verification** - Svensk BankID integration
- **Address Verification** - Adressvalidering
- **Enhanced Due Diligence** - För höga transaktionsbelopp

#### AML Screening ✅
- **Sanctions Screening** - EU, UN, US sanktionslistor
- **PEP Screening** - Politiskt exponerade personer
- **Watchlist Screening** - Övriga risklistor
- **Adverse Media** - Negativ mediabevakning

#### Risk Assessment
```typescript
enum RiskLevel {
  LOW = 'LOW',        // 0-30 points
  MEDIUM = 'MEDIUM',  // 31-60 points  
  HIGH = 'HIGH',      // 61-80 points
  CRITICAL = 'CRITICAL' // 81-100 points
}
```

#### Transaktionsgränser
- **Ingen verifiering**: 10,000 SEK
- **E-post verifiering**: 100,000 SEK
- **Dokumentverifiering**: 500,000 SEK
- **BankID verifiering**: 10,000,000 SEK
- **Enhanced DD**: 2,000,000+ SEK

### 4. Bolagsverket Integration (`/src/services/compliance/bolagsverketService.ts`)

#### Företagsdata ✅
- **Organisationsnummer validation** - Format och checksumma
- **Företagsinformation** - Namn, status, adress, bransch
- **Styrelse och firmatecknare** - Aktuella roller och befogenheter
- **Aktiekapital och ägarstruktur** - Grundläggande finansdata
- **Riskindikatorer** - Konkurs, likvidation, förändringar

#### Company Verification
```typescript
interface CompanyVerificationResult {
  isValid: boolean;
  isActive: boolean;
  verificationLevel: 'BASIC' | 'VERIFIED' | 'ENHANCED';
  riskIndicators: RiskIndicator[];
  lastVerified: Date;
}
```

#### Funktioner
- **Company Search** - Sök företag via namn eller org.nr
- **Ownership Structure** - Ägarstruktur och UBO-spårning
- **Signatory Check** - Kontroll av firmatecknare
- **Financial Indicators** - Grundläggande riskbedömning

### 5. Legal Advisor Directory (`/src/services/compliance/legalAdvisorService.ts`)

#### Rådgivarprofiler ✅
- **Specialiseringar** - M&A, avtalsrätt, skatterätt, etc.
- **Credentials** - Advokatexamen, certifieringar
- **Experience** - År i yrket, antal transaktioner
- **Pricing** - Timpris, fasta avgifter, konsultationskostnad
- **Availability** - Tillgänglighet och responstider
- **Reviews** - Klientrecensioner och betyg

#### Sökfunktioner
```typescript
interface AdvisorSearchParams {
  specialization?: LegalArea[];
  location?: LocationFilter;
  priceRange?: PriceRange;
  experience?: ExperienceFilter;
  rating?: RatingFilter;
  transactionValue?: number;
}
```

#### Bokning System
- **Consultation Requests** - Begär juridisk rådgivning
- **Cost Estimation** - Automatisk kostnadsberäkning
- **Time Slot Management** - Bokningshantering
- **Review System** - Betygsättning efter genomfört arbete

## Installation & Setup

### 1. Miljövariabler
Lägg till i `.env`:

```bash
# GDPR & Compliance
GDPR_EXPORT_DIR=/secure/gdpr-exports
COMPLIANCE_REPORTS_DIR=/secure/compliance-reports
MESSAGE_ENCRYPTION_KEY=your-32-character-encryption-key-here

# KYC/AML Providers
KYC_PROVIDER_URL=https://api.onfido.com/v3
KYC_PROVIDER_API_KEY=your_onfido_api_key
KYC_WEBHOOK_SECRET=your_webhook_secret

AML_PROVIDER_URL=https://api.complyadvantage.com
AML_PROVIDER_API_KEY=your_complyadvantage_key

# BankID (Sverige)
BANKID_API_URL=https://appapi2.test.bankid.com
BANKID_CERT_PATH=/path/to/bankid.p12
BANKID_KEY_PATH=/path/to/bankid.key
BANKID_CA_PATH=/path/to/bankid-ca.crt

# Bolagsverket API
BOLAGSVERKET_API_URL=https://api.bolagsverket.se
BOLAGSVERKET_API_KEY=your_bolagsverket_api_key

# Legal Services
LEGAL_ADVISOR_VERIFICATION_ENABLED=true
```

### 2. Database Migration

```sql
-- GDPR Tables
CREATE TABLE user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    consent_type VARCHAR(50) NOT NULL,
    granted BOOLEAN NOT NULL,
    granted_at TIMESTAMP,
    revoked_at TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, consent_type)
);

-- KYC/AML Tables  
CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    verification_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    risk_level VARCHAR(20),
    confidence INTEGER,
    findings JSONB,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE aml_screenings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    check_type VARCHAR(50) NOT NULL,
    risk_score INTEGER,
    matches JSONB,
    screened_at TIMESTAMP DEFAULT NOW()
);

-- Company Verification
CREATE TABLE company_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_number VARCHAR(20) NOT NULL UNIQUE,
    verification_data JSONB,
    risk_indicators JSONB,
    last_verified TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. API Routes Setup

Lägg till i huvudroutingfilen:

```typescript
// src/app.ts
import complianceRoutes from './routes/compliance';
import kycAmlRoutes from './routes/kyc-aml';

app.use('/api/compliance', complianceRoutes);
app.use('/api/kyc-aml', kycAmlRoutes);
```

### 4. BankID Certificates Setup

För BankID integration i produktion:

```bash
# Ladda ner BankID certifikat från bankid.com
# Placera certifikat i säker mapp
mkdir -p /secure/bankid
cp bankid.p12 /secure/bankid/
cp bankid.key /secure/bankid/
cp bankid-ca.crt /secure/bankid/

# Sätt korrekta behörigheter
chmod 600 /secure/bankid/*
chown app:app /secure/bankid/*
```

## Compliance Features

### GDPR Data Subject Rights ✅

#### Rätt till Information (Art. 13-14)
- Transparent information om databehandling
- Rättslig grund för varje syfte
- Kontaktuppgifter till personuppgiftsansvarig och DPO

#### Rätt till Tillgång (Art. 15)
- Komplett export av personuppgifter
- Information om behandlingssyften
- Mottagare av personuppgifter

#### Rätt till Rättelse (Art. 16)
- Möjlighet att korrigera felaktiga uppgifter
- Automatisk uppdatering i relaterade system

#### Rätt till Radering (Art. 17)
- "Rätt att bli glömd"
- Soft delete för lagkrav
- Hard delete där möjligt

#### Rätt till Dataportabilitet (Art. 20)
- Strukturerad, maskinläsbar export
- JSON, XML, CSV format
- Säker filöverföring

### KYC/AML Compliance ✅

#### EU AML Directive (5AMLD)
- Customer Due Diligence (CDD)
- Enhanced Due Diligence (EDD) för högrisk
- Ongoing monitoring
- Record keeping requirements

#### Swedish AML Law (2017:630)
- Riskbedömning av kunder
- Fördjupad kundkännedom
- Rapportering till FIU
- Sanktionsscreening

#### Transaction Monitoring
- Automatisk riskscoring
- Unusual transaction detection
- Threshold monitoring
- SAR filing preparation

### Contract Compliance ✅

#### Swedish Contract Law
- Avtalslagen (1915:218) compliance
- Konsumentköplagen requirements
- Köplagen för B2B transactions
- Distance selling regulations

#### Legal Template Validation
- Mandatory clauses verification
- Jurisdiction specific requirements
- Consumer protection compliance
- GDPR data processing clauses

## Security & Privacy

### Data Encryption ✅
- AES-256 encryption för känslig data
- Secure key management
- Encrypted data transmission
- Secure file storage

### Access Controls ✅
- Role-based access control (RBAC)
- Principle of least privilege
- Audit logging för all access
- Multi-factor authentication för admin

### Data Retention ✅
- Automated data lifecycle management
- Legal hold för pågående mål
- Secure data destruction
- Retention policy compliance

## Testing & Validation

### GDPR Testing
```bash
# Test data export
curl -X POST /api/compliance/gdpr/export \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"includePersonalData": true, "format": "JSON"}'

# Test data deletion
curl -X POST /api/compliance/gdpr/delete \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Confirm-Hard-Deletion: I-UNDERSTAND-THIS-IS-IRREVERSIBLE" \
  -d '{"deletionType": "HARD", "reason": "User request"}'
```

### KYC/AML Testing
```bash
# Test document verification
curl -X POST /api/kyc-aml/kyc/verify \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "verificationType": "DOCUMENT_VERIFICATION",
    "documentType": "PASSPORT",
    "personalData": {...}
  }'

# Test AML screening
curl -X POST /api/kyc-aml/aml/check \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "checkType": "COMPREHENSIVE_SCREENING",
    "personalData": {...}
  }'
```

## Production Deployment

### Legal Requirements ✅
- [ ] GDPR compliance audit
- [ ] AML policy documentation
- [ ] Data processing agreements
- [ ] Privacy policy updates
- [ ] Cookie policy compliance

### Security Checklist ✅
- [ ] Penetration testing
- [ ] Vulnerability assessment
- [ ] Encrypted communications
- [ ] Secure key storage
- [ ] Access logging enabled

### Monitoring ✅
- [ ] GDPR request tracking
- [ ] AML alert monitoring
- [ ] Failed verification alerts
- [ ] System performance metrics
- [ ] Compliance reporting

## Legal Disclaimer

⚖️ **Viktigt juridiskt meddelande:**

Detta system tillhandahåller verktyg för regelefterlevnad men ersätter inte professionell juridisk rådgivning. 

**Rekommendationer:**
1. Konsultera kvalificerad jurist före produktionsdrift
2. Genomför regelbunden compliance-granskning
3. Håll mallar uppdaterade med lagändringar
4. Implementera regelbunden personalutbildning
5. Dokumentera alla compliance-processer

**Ansvarsfriskrivning:**
Användning av detta system sker på egen risk. 123Hansa AB ansvarar inte för juridiska konsekvenser av felaktig användning.

## Nästa Steg

✅ **SESSION 8 KOMPLETT** - Legal & Regulatory Compliance

**Nästa utvecklingsområden enligt planen:**
- **Analytics & Reporting** (Session 9) - Affärsanalyser och rapporter
- **Mobile Application** (Session 10) - React Native app
- **Professional Services** (Session 11) - Mäklarnätverk integration
- **Performance Optimization** (Session 12) - Skalning och prestanda

**Nästa steg är Advanced Analytics & Business Intelligence** för djupare insikter i marknadsaktivitet och transaktionsmönster.