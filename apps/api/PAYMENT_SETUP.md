# Tubba Payment & Transaction System Setup Guide

## Översikt
Komplett guide för att sätta upp Tubba's betalnings- och transaktionssystem (Session 7).

## Vad som implementerats

### 1. Backend Payment Services

#### Stripe Integration (`/src/services/payments/stripeService.ts`)
- ✅ Komplett Stripe Payment Intents integration
- ✅ 3D Secure autentisering för förbättrad säkerhet
- ✅ Kundhantering och sparade betalningsmetoder
- ✅ Återbetalningar och partial refunds
- ✅ Webhook hantering för real-time uppdateringar
- ✅ Multi-currency stöd för nordiska marknader

#### Nordic Payment Methods (`/src/services/payments/nordicPaymentService.ts`)
- ✅ **Swish** - Svensk mobilbetalning med BankID integration
- ✅ **MobilePay** - Dansk mobilbetalning 
- ✅ **Vipps** - Norsk mobilbetalning
- ✅ Telefonnummervalidering för respektive land
- ✅ Webhook hantering för statusuppdateringar
- ✅ QR-kod och deep-link stöd

#### Payment Processing (`/src/services/payments/paymentService.ts`)
- ✅ Enhetlig API för alla betalningsmetoder
- ✅ Automatisk avgiftsberäkning per metod och valuta
- ✅ Escrow integration för säkra transaktioner
- ✅ Notifikationer för alla parter
- ✅ Komplett felhantering och logging

#### Escrow System (`/src/services/payments/escrowService.ts`)
- ✅ Säker fondhantering mellan köpare och säljare
- ✅ Automatisk frisläppning efter tidsperiod
- ✅ Manuell frisläppning vid leverans
- ✅ Återbetalningar och disputhantering
- ✅ Komplett audit trail för alla transaktioner
- ✅ Commission beräkning och hantering

#### Currency Service (`/src/services/payments/currencyService.ts`)
- ✅ Real-time valutaomvandling med fallback rates
- ✅ Multi-currency stöd (SEK, NOK, DKK, EUR, USD, GBP)
- ✅ Nordisk-specifik formattering och regler
- ✅ Cross-border avgiftsberäkning
- ✅ AML-kompatibla limiter per valuta

### 2. API Endpoints

#### Payment Controllers (`/src/controllers/payments/`)
- ✅ `POST /api/payments/payments` - Skapa betalning
- ✅ `POST /api/payments/payments/:id/process` - Behandla betalning
- ✅ `GET /api/payments/payments/:id` - Hämta betalning
- ✅ `GET /api/payments/transactions/:id/payments` - Transaktionsbetalningar
- ✅ `GET /api/payments/users/me/payments` - Användarens betalningar
- ✅ `POST /api/payments/payments/:id/refund` - Skapa återbetalning
- ✅ `GET /api/payments/payment-fees` - Beräkna avgifter

#### Webhook Endpoints (`/src/routes/webhooks.ts`)
- ✅ `POST /api/webhooks/stripe` - Stripe webhooks
- ✅ `POST /api/webhooks/swish/:paymentId` - Swish webhooks
- ✅ `POST /api/webhooks/mobilepay/:paymentId` - MobilePay webhooks
- ✅ `POST /api/webhooks/vipps/:paymentId` - Vipps webhooks

### 3. Security & Compliance (`/src/middleware/paymentSecurity.ts`)

#### PCI DSS Compliance
- ✅ Helmet säkerhetsheaders för betalningssidor
- ✅ Content Security Policy för Stripe integration
- ✅ HTTPS enforcement och HSTS headers
- ✅ XSS och clickjacking skydd

#### Anti-Fraud System
- ✅ Anomalidetektering för misstänkta betalningar
- ✅ Rate limiting för betalningsendpoints
- ✅ IP-adress och User-Agent spårning
- ✅ Automatisk blockering vid högriskbeteende
- ✅ Fraud alerts och logging

#### Data Protection
- ✅ Kryptering av känslig betalningsdata
- ✅ Input sanitization för alla betalningsparametrar
- ✅ Webhook signatur validering
- ✅ Säker datalagring enligt GDPR

### 4. Frontend Payment Interface

#### Payment Services (`/src/services/paymentService.ts`)
- ✅ TypeScript API klient för alla betalningsfunktioner
- ✅ Betalningsmetod hantering och validering
- ✅ Valuta formattering för nordiska marknader
- ✅ Avgiftsberäkning och cost transparency
- ✅ Payment status tracking och uppdateringar

#### Payment Components (`/src/components/payment/`)

**PaymentMethodSelector** - Intelligente betalningsmetodval
- ✅ Automatisk filtrering baserat på land och valuta
- ✅ Real-time avgiftsberäkning för varje metod
- ✅ Visuell presentation med ikoner och beskrivningar
- ✅ Säkerhetsinformation för olika metoder

**PaymentForm** - Komplett betalningsformulär
- ✅ Stripe Elements integration för kortbetalningar
- ✅ Nordic payment methods med telefonnummervalidering
- ✅ 3D Secure hantering och användarguiding
- ✅ Deep-link integration för mobilappar
- ✅ Progressive enhancement och graceful degradation

#### Payment History (`/src/pages/PaymentHistoryPage.tsx`)
- ✅ Komplett betalningshistorik med filtrering
- ✅ Status tracking och visuell representation
- ✅ Transaktionsdetaljer och kvitton
- ✅ Exportfunktionalitet för bokföring
- ✅ Statistik och summary information

### 5. Database Schema Extensions

#### Prisma Models (utökade)
- ✅ **Payment** - Komplett betalningshantering
- ✅ **PaymentRefund** - Återbetalningsspårning
- ✅ **EscrowAccount** - Säker fondhantering
- ✅ **UserPaymentMethod** - Sparade betalningsmetoder
- ✅ **DisputeCase** - Disputhantering
- ✅ **Transaction** - Utökad med escrow och commissioning

## Installation & Setup

### 1. Miljövariabler
Lägg till i `.env`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Nordic Payment Methods
SWISH_API_URL=https://mss.cpc.getswish.net/swish-cpcapi/api/v1
SWISH_MERCHANT_ID=your_swish_merchant_id
SWISH_CERTIFICATE_PATH=/path/to/swish/certificate.p12
SWISH_PRIVATE_KEY_PATH=/path/to/swish/private.key
SWISH_CALLBACK_URL=https://your-domain.com/api/webhooks

MOBILEPAY_API_URL=https://api.mobilepay.dk/v1
MOBILEPAY_CLIENT_ID=your_mobilepay_client_id
MOBILEPAY_CLIENT_SECRET=your_mobilepay_client_secret
MOBILEPAY_WEBHOOK_URL=https://your-domain.com/api/webhooks
MOBILEPAY_REDIRECT_URL=https://your-domain.com/payment/return

VIPPS_API_URL=https://api.vipps.no
VIPPS_CLIENT_ID=your_vipps_client_id
VIPPS_CLIENT_SECRET=your_vipps_client_secret
VIPPS_SUBSCRIPTION_KEY=your_vipps_subscription_key
VIPPS_MERCHANT_SERIAL_NUMBER=your_merchant_serial_number
VIPPS_CALLBACK_URL=https://your-domain.com/api/webhooks
VIPPS_FALLBACK_URL=https://your-domain.com/payment/return

# Exchange Rates
EXCHANGE_RATES_API_KEY=your_api_key_for_exchange_rates

# Security
PAYMENT_ENCRYPTION_KEY=your_32_character_encryption_key_here
```

### 2. Database Migration

```bash
cd apps/api

# Kör migrering för nya payment schemas
npx prisma migrate dev --name add-payment-system

# Generera nya Prisma types
npx prisma generate
```

### 3. Frontend Dependencies

```bash
cd apps/web

# Installera Stripe och date formatting
npm install @stripe/stripe-js @stripe/react-stripe-js date-fns
```

### 4. Webhook Setup

#### Stripe Webhooks
1. Gå till Stripe Dashboard → Webhooks
2. Lägg till endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Välj events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.requires_action`
   - `payment_intent.canceled`
   - `refund.created`
   - `refund.updated`

#### Nordic Payment Webhooks
Konfigurera i respektive leverantörs admin panel:
- **Swish**: `https://your-domain.com/api/webhooks/swish/{paymentId}`
- **MobilePay**: `https://your-domain.com/api/webhooks/mobilepay/{paymentId}`
- **Vipps**: `https://your-domain.com/api/webhooks/vipps/{paymentId}`

### 5. SSL Certificates (Swish)

För Swish behöver du installera deras test/production certifikat:

```bash
# Ladda ner certifikat från Swish
# Placera i säker mapp med begränsade rättigheter
chmod 600 /path/to/swish/certificate.p12
chmod 600 /path/to/swish/private.key
```

## Testing & Validation

### 1. Stripe Test Cards
```
# Successful payment
4242424242424242

# Requires authentication (3D Secure)
4000002500003155

# Declined card
4000000000000002

# Insufficient funds
4000000000009995
```

### 2. Nordic Payment Testing
- **Swish**: Använd test-miljö med test-certifikat
- **MobilePay**: Sandbox miljö med test-telefonnummer
- **Vipps**: Test miljö med Vipps test app

### 3. Security Testing
```bash
# Testa rate limiting
curl -X POST https://your-domain.com/api/payments/payments \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "SEK"}' \
  --repeat 15

# Testa input sanitization
curl -X POST https://your-domain.com/api/payments/payments \
  -H "Content-Type: application/json" \
  -d '{"amount": "invalid", "currency": "<script>alert(1)</script>"}'
```

## Production Deployment

### 1. Security Checklist
- [ ] Använd riktiga API-nycklar (inte test-nycklar)
- [ ] Konfigurera stark PAYMENT_ENCRYPTION_KEY (32 tecken hex)
- [ ] Sätt upp SSL/TLS certifikat för alla endpoints
- [ ] Konfigurera CORS headers korrekt
- [ ] Begränsa API-åtkomst till tillåtna domäner
- [ ] Implementera proper logging och monitoring
- [ ] Sätt upp backup och disaster recovery

### 2. Monitoring & Alerting
```bash
# Implementera logging för:
# - Alla betalningsförsök
# - Misslyckade betalningar
# - Fraud detection alerts
# - Webhook failures
# - Rate limit violations
```

### 3. Compliance
- [ ] PCI DSS Level 1 compliance verification
- [ ] GDPR data processing documentation
- [ ] AML (Anti-Money Laundering) procedures
- [ ] Nordic financial regulations compliance
- [ ] Security audit och penetration testing

## Troubleshooting

### Common Issues

1. **Stripe payments failing**
   - Kontrollera att STRIPE_SECRET_KEY är korrekt
   - Verifiera webhook endpoint är tillgänglig
   - Kolla Stripe Dashboard för fel

2. **Nordic payments inte fungerar**
   - Kontrollera certifikat-sökvägar för Swish
   - Verifiera API-nycklar för MobilePay/Vipps
   - Testa webhook endpoints manuellt

3. **Escrow inte fungerar**
   - Kontrollera att transactions har escrowAccountId
   - Verifiera att payment webhook uppdaterar escrow status
   - Kolla database constraints och relationer

4. **Rate limiting för aggressiv**
   - Justera rate limit inställningar i middleware
   - Implementera användare-specifik rate limiting
   - Lägg till whitelist för kända IP-adresser

## Nästa Steg

✅ **SESSION 7 KOMPLETT** - Payment & Transaction System

**Nästa utvecklingsområden:**
1. **Advanced Analytics** - Transaktionsanalyser och rapporter
2. **Mobile App** - React Native app med payment integration
3. **Business Intelligence** - Dashboard för försäljningsstatistik
4. **International Expansion** - Stöd för fler länder och valutor

**Nästa steg är Legal & Regulatory Compliance (Session 8)** enligt utvecklingsplanen:
- GDPR compliance verktyg
- Svenska avtalsmallar för företagsöverlåtelser
- KYC/AML verifieringsprocesser
- Juridisk rådgivare-directory