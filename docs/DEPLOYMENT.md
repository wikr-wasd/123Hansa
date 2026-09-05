# Miljöer och driftsättning

## Brancher

| Branch | Roll | Deploy |
|---|---|---|
| `dev` | Standardarbetsbranch. Allt arbete sker här | Preview |
| `main` | Produktion | Produktion |

### Flödet

1. **Allt arbete sker på `dev`.** Committa och pusha löpande — lokal och
   `origin/dev` ska alltid ha samma status.
2. Varje push till `dev` ska ge en preview-deploy. William får URL:en.
3. **Först när William uttryckligen godkänt** preview:n:
   ```bash
   git checkout main && git merge dev --ff-only && git push origin main && git checkout dev
   ```
4. Committa **aldrig** direkt på `main`.
5. Kontrollera `git status` och `git log @{u}..` vid sessionsstart och slut.

⚠️ Deploya **aldrig** till produktion utan Williams uttryckliga godkännande.

### Historik: brancherna gled isär

`main` och `staging` skildes åt med **114 commits** under 2025. `main` var
default-branch och stannade 2025-07-05; `staging` bar all ny kod fram till
2025-07-10. Den som klonade repot och läste `main` läste ett annat projekt än det
som byggdes.

`staging` är avvecklad till förmån för `dev`. Låt aldrig två brancher ligga och
glida igen — slå ihop dem eller ta bort den ena.

---

## ⚠️ Lova aldrig en preview-URL du inte sett

Kontrollera att ett Vercel-projekt **faktiskt** bygger det här repot innan du ger
William en länk. Systerprojektet Burp hade ett Vercel-projekt som såg rätt ut i
listan men var inställt på fel ramverk och en rotkatalog som inte fanns; senaste
lyckade bygget var över ett år gammalt. Ingen märkte det, för ingen tittade.

Kontrollera i Vercels dashboard:

- Att projektet är kopplat till `wikr-wasd/123Hansa`
- Att **Root Directory** är repots rot (inte `apps/web`)
- Att senaste bygget är färskt och grönt
- Att branchen du pushade faktiskt triggade ett bygge

---

## Bygget

`vercel.json` i roten styr allt:

```json
{
  "buildCommand": "npm run build:web",
  "installCommand": "npm install",
  "outputDirectory": "apps/web/dist",
  "framework": "vite"
}
```

`npm install` i roten installerar alla workspaces. `npm run build:web` bygger
`@123hansa/web` med Vite till `apps/web/dist`.

### Vad som togs bort, och varför

Bygget gick tidigare genom **`build.cjs`**, ett skript som letade sig uppåt i
filträdet efter projektroten, **genererade tomma paket** (`packages/shared` och
`packages/ui` med innehållet `export {}`), byggde webben och kopierade `dist` till
roten.

Det fanns för att workspace-uppsättningen var trasig: rotens `package.json` hade
bara `apps/*` som workspaces medan `apps/web/tsconfig.json` pekade på
`packages/*`. Skriptet lappade symtomet vid varje bygge.

Med `packages/*` i `workspaces` behövs inget av det. Samtidigt försvann:

- **Hårdkodade staging-URL:er** i `env`-blocket. Miljövariabler hör hemma i
  Vercels dashboard, per miljö — inte i en fil i repot där preview och produktion
  får samma värden.
- **`Access-Control-Allow-Origin`** låst till en staging-domän. CORS hör hemma i
  API:t, som vet vem som frågar.
- **`X-XSS-Protection`.** Utfasad, och i vissa äldre browsers en sårbarhet i sig.
- **Redirects för `servicematch.se` och `tubba`** — kvarlämningar från andra
  projekt.
- **`vercel.fallback.json`, `vercel.production.json`, `vercel.staging.json`** —
  tre parallella konfigurationer som ingen visste vilken av som gällde.

---

## Miljövariabler

Sätts i Vercels dashboard per miljö. `.env.example` visar vilka som behövs.
Ingenting hemligt checkas in — `.env*` ligger i `.gitignore`.

| Variabel | Miljö | Kommentar |
|---|---|---|
| `DATABASE_URL` | båda | Egen databas per miljö. Preview får aldrig peka på produktion |
| `JWT_SECRET` | båda | Olika värden per miljö |
| `VITE_API_URL` | båda | Sätts av miljön, aldrig i `vercel.json` |
| `SENTRY_AUTH_TOKEN` | valfri | Utan den hoppas Sentry-pluginet över i bygget |

**Preview får aldrig peka på produktionsdatabasen.** En testkörning som råkar
skriva i den databasen syns inte som ett fel förrän långt senare.

---

## Databas

PostgreSQL med Prisma. Migrationer i `apps/api/prisma/`.

Kör migrationer mot en miljö innan koden som behöver dem släpps dit — annars
frågar appen efter kolumner som inte finns, vilket ser ut som ett applikationsfel
och inte som ett driftsättningsfel.

---

## Docker (lokalt)

`docker-compose.yml` och `docker/` finns för lokal utveckling. `Dockerfile.production`
och `nginx.production.conf` är från ett tidigare självhostat upplägg och används
inte av Vercel-flödet.

Om självhostning inte är aktuellt bör de tas bort — en driftfil som inte används
är en driftfil ingen underhåller, och nästa läsare tror att den gäller.

---

## Rollback

Vercel behåller tidigare deploys. En felaktig produktionsdeploy rullas tillbaka i
dashboarden, inte genom en revert-commit — reverten tar minuter, rollbacken tar
sekunder. Gör rollbacken först, reverten sedan.
