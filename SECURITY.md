# 123Hansa Security Implementation

## Översikt
Detta dokument beskriver de säkerhetsåtgärder som implementerats i 123Hansa-plattformen för att skydda mot hackers, spam och DDoS-attacker.

## Implementerade Säkerhetsåtgärder

### 1. DDoS-skydd
- **Avancerat DDoS-skydd**: Automatisk detektion av misstänkta mönster
- **Rate limiting**: Begränsar antal förfrågningar per IP och tidsperiod
- **Speed limiting**: Förseningar för misstänkt snabba förfrågningar
- **IP-bannlysning**: Automatisk och manuell bannlysning av skadliga IP-adresser
- **Mönsterigenkänning**: Detekterar bot-aktivitet och crawling

#### Konfiguration:
```javascript
// DDoS-skyddskonfiguration
const config = {
  maxRequestsPerMinute: 60,
  maxRequestsPer5Minutes: 200,
  maxRequestsPerHour: 1000,
  tempBanDuration: 15 * 60 * 1000, // 15 minuter
  longBanDuration: 60 * 60 * 1000   // 1 timme
};
```

### 2. Rate Limiting
Olika gränser för olika typer av endpoints:

- **Allmänna förfrågningar**: 100 per 15 minuter
- **Autentisering**: 5 försök per 15 minuter
- **Registrering**: 3 försök per timme
- **Betalningar**: 10 försök per timme
- **Kontaktformulär**: 5 per timme

### 3. Input-validering och Sanitering

#### E-postvalidering:
- **Format-validering**: RFC-kompatibel e-post format
- **Domän-validering**: Kontrollerar giltiga domäner
- **Temporära e-post**: Blockerar tillfälliga e-postadresser
- **Misstänka mönster**: Detekterar och blockerar ogiltiga tecken

#### Lösenordsvalidering:
- **Längd**: Minimum 8, maximum 128 tecken
- **Komplexitet**: Kräver stora/små bokstäver, siffror och specialtecken
- **Säker lagring**: bcrypt-hashing med salt

#### Allmän input-sanitering:
- **XSS-skydd**: Strippar skadlig HTML och JavaScript
- **SQL-injection skydd**: Parametriserade queries med Prisma
- **Storleksbegränsningar**: Begränsar input-storlek

### 4. CSRF-skydd
- **Token-baserat**: Unika tokens för varje session
- **Session-validering**: Verifierar tokens mot session
- **Automatisk generering**: Tokens genereras automatiskt

### 5. Anti-spam åtgärder

#### Honeypot-fält:
```html
<!-- Dolt fält som bots fyller i -->
<input type="text" name="website" style="display:none" tabindex="-1">
```

#### Spam-detektion:
- **Nyckelord**: Detekterar vanliga spam-nyckelord
- **Länkar**: Begränsar antal länkar i meddelanden
- **Versaler**: Detekterar överdriven användning av versaler
- **Upprepningar**: Identifierar upprepade tecken

#### Timing-kontroller:
- **Minimum-tid**: Formulär kan inte skickas för snabbt
- **Maximum försök**: Begränsar antal försök per IP

### 6. Säkerhetsheaders
```javascript
// Helmet-konfiguration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      connectSrc: ["'self'", "https://api.swish.nu"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 7. Session-säkerhet
- **Säkra cookies**: HTTPOnly, Secure, SameSite
- **Session-lagring**: MongoDB med TTL
- **Automatisk utloggning**: Efter inaktivitet

### 8. Filuppladdning-säkerhet
- **Tillåtna filtyper**: Endast säkra format (bilder, PDF, dokument)
- **Storleksbegränsning**: Maximum 10MB per fil
- **Magic number validering**: Verifierar verklig filtyp
- **Virus-scanning**: (kan implementeras med ClamAV)

### 9. Databasäkerhet
- **Prepared statements**: Förhindrar SQL-injection
- **Begränsade behörigheter**: Databas-användare med minimal åtkomst
- **Kryptering**: Känslig data krypteras
- **Backup-säkerhet**: Säkra och krypterade backuper

### 10. Övervakning och Logging
- **Säkerhetsloggning**: Alla misstänkta aktiviteter loggas
- **Real-time övervakning**: Automatisk detektion av hot
- **Varningar**: Automatiska notifieringar för kritiska händelser

## API-endpoints för säkerhet

### CSRF Token
```
GET /csrf-token
Response: { "csrfToken": "abc123...", "message": "Token generated" }
```

### Säkerhetsstatus
```
GET /security-status
Response: {
  "status": "secure",
  "protections": {
    "ddosProtection": { "enabled": true, "bannedIPs": 0 },
    "rateLimiting": { "enabled": true },
    "csrfProtection": { "enabled": true },
    "inputSanitization": { "enabled": true }
  }
}
```

## Säkra formulär-komponenter

### SecureForm
```tsx
import { SecureForm, SecureEmailInput } from '@/components/common/SecureForm';

<SecureForm onSubmit={handleSubmit} requireCaptcha={false} enableHoneypot={true}>
  <SecureEmailInput name="email" required />
  <SecurePasswordInput name="password" required />
</SecureForm>
```

### Funktioner:
- **Automatisk validering**: Client-side och server-side
- **CSRF-skydd**: Automatisk token-hantering
- **Anti-spam**: Honeypot och timing-kontroller
- **Rate limiting**: Förhindrar för många försök

## Miljövariabler för säkerhet

```env
# JWT
JWT_SECRET=your-super-secure-secret-here-minimum-32-characters

# Rate limiting
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX=100

# Trusted IPs (optional)
TRUSTED_IPS=127.0.0.1,10.0.0.1

# Security features
ENABLE_CSRF=true
ENABLE_DDOS_PROTECTION=true
ENABLE_SPAM_PROTECTION=true
```

## Rekommendationer för produktion

### 1. Nätverk-säkerhet
- **Firewall**: Konfigurera brandvägg för att blockera onödig trafik
- **Load balancer**: Använd med DDoS-skydd (t.ex. Cloudflare)
- **VPN**: Säker åtkomst för administratörer

### 2. Server-säkerhet
- **OS-uppdateringar**: Håll systemet uppdaterat
- **Fail2ban**: Automatisk IP-bannlysning för misstänkt aktivitet
- **Monitoring**: Använd verktyg som Datadog, New Relic eller Prometheus

### 3. Databas-säkerhet
- **Brandvägg**: Begränsa databas-åtkomst
- **Kryptering**: Aktivera encryption-at-rest
- **Backup**: Regelbundna, krypterade backuper
- **Auditloggning**: Spåra alla databasoperationer

### 4. SSL/TLS
- **HTTPS endast**: Omdirigera all HTTP-trafik till HTTPS
- **Strong ciphers**: Använd moderna krypteringsalgoritmer
- **HSTS**: Aktivera HTTP Strict Transport Security

### 5. Övervakning
- **Real-time alerts**: Notifieringar för säkerhetsincidenter
- **Log aggregation**: Centraliserad loggning med ELK stack
- **Metrics**: Övervaka prestanda och säkerhetsmetriker

## Säkerhetsincident-respons

### 1. Detektion
- Automatiska varningar för misstänkt aktivitet
- Övervakning av säkerhetsloggar
- Externa threat intelligence feeds

### 2. Analys
- Bedöm allvarlighetsgrad
- Identifiera påverkade system
- Dokumentera incident

### 3. Eindämmning
- Blockera skadliga IP-adresser
- Isolera påverkade system
- Aktivera emergency rate limits

### 4. Återställning
- Patcha sårbarheter
- Återställ från säkra backuper
- Verifiera systemintegritet

### 5. Lärdomar
- Dokumentera incident
- Uppdatera säkerhetsprocedurer
- Genomför säkerhetsutbildning

## Kontakt för säkerhetsfrågor

För att rapportera säkerhetsproblem:
- **E-post**: security@123hansa.se
- **Krypterad**: Använd vår PGP-nyckel
- **Responsible disclosure**: Vi uppskattar ansvarsfull avslöjande

## Säkerhetsuppdateringar

Denna dokumentation uppdateras regelbundet. Senast uppdaterad: 2024-07-06

För de senaste säkerhetsuppdateringarna, se vår changelog och säkerhetsbulletiner.