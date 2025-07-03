# 123hansa Testmiljö Setup

## 🚀 Snabbstart

### Alternativ 1: Enkel testserver (Rekommenderas för snabb testning)
```bash
./simple-start.sh
```

**Detta ger dig:**
- Demo API server på http://localhost:3002 
- Publik URL via Localtunnel: https://123hansa-simple.loca.lt
- 12 demo listings för testning
- Ingen databas krävs

**För att stoppa:**
```bash
./stop-simple.sh
```

### Alternativ 2: Full Docker-miljö (För fullständig utveckling)
```bash
./start-test-env.sh
```

**Detta ger dig:**
- API server på http://localhost:3002
- Web app på http://localhost:3000  
- PostgreSQL databas på localhost:5432
- Redis på localhost:6379
- MailHog email testing på http://localhost:8025
- Publik URL via Localtunnel: https://123hansa-test.loca.lt

**För att stoppa:**
```bash
./stop-test-env.sh
```

## 🔧 Förutsättningar

### För enkel testserver:
- Node.js installerat
- Localtunnel (installeras automatiskt)

### För Docker-miljö:
1. **Aktivera Docker Desktop WSL2-integration:**
   - Öppna Docker Desktop
   - Gå till Settings > General > "Use WSL 2 based engine"
   - Gå till Settings > Resources > WSL Integration
   - Aktivera integration för din WSL distribution

## 🌐 Publika URLer (Alltid tillgängliga)

Oavsett nätverksproblem kan du alltid nå dina servrar via:
- https://123hansa-simple.loca.lt (enkel server)
- https://123hansa-test.loca.lt (full miljö)

Dessa URLer fungerar från vilken enhet/plats som helst!

## 📋 API Endpoints

### Demo API innehåller:
- `GET /` - API information
- `GET /api/listings/search` - Sök listings  
- `GET /api/listings/:id` - Specifik listing
- `GET /api/categories` - Asset kategorier
- `GET /api/statistics` - Marketplace statistik
- `POST /api/listings/:id/interest` - Visa intresse
- `POST /api/listings` - Skapa ny listing

### Exempel användning:
```bash
# Testa API
curl https://123hansa-simple.loca.lt/

# Hämta alla listings
curl https://123hansa-simple.loca.lt/api/listings/search

# Hämta kategorier
curl https://123hansa-simple.loca.lt/api/categories
```

## 🧪 Testdata

Servern innehåller 12 realistiska demo listings:
- 3 Företag & Bolag (AB, HB)
- 3 Digitala Tillgångar (webbsidor, appar, domäner)
- 2 Dokument & Rättigheter (fakturor, patent)
- 2 Företagsfastigheter & Lokaler
- 2 Företagstjänster (kundregister, franchise)

## 🛠️ Felsökning

### Om localhost inte fungerar:
- Använd de publika Localtunnel URLs istället
- Kontrollera Windows firewall
- Kontrollera att WSL2 nätverket fungerar

### Om Docker inte fungerar:
- Kontrollera Docker Desktop är igång
- Verifiera WSL2-integration är aktiverad
- Kör `docker --version` i WSL för att testa

### Om Localtunnel inte fungerar:
- Tunnlarna får nya URLs varje gång de startas
- Kolla terminalutput för aktuell URL
- Prova olika subdomain-namn