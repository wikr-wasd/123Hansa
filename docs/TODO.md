# Arbetslistan

Följ den uppifrån. Ordningen är inte godtycklig: varje avsnitt förutsätter det
ovanför.

Markera klart först när `npm run verify` går igenom och funktionen faktiskt
fungerar i appen — inte när koden är skriven. Se `TESTING.md`.

---

## Fas 0 — Grunden ✅ klar 2026-09-05

- [x] `@hansa/core` med pengar, land, moms, provision, org.nr och språk
- [x] 83 tester, kontrollsiffrorna verifierade mot verkliga bolag
- [x] Riktiga npm workspaces — `build.cjs` genererar inte längre tomma paket
- [x] `vercel.json` utan hårdkodade staging-URL:er
- [x] Dokumentationen samlad i `docs/`, en fil per ämne
- [x] CI som kör type-check, lint, test och build

⚠️ **Rättelse 2026-09-05:** CI-punkten var bockad men körningen var röd. Steget
`type-check` hade inget `continue-on-error` och föll på 25 960 fel. Se fas 0b.

---

## Fas 0b — Få verktygskedjan att gå att köra ⏳ delvis klar 2026-09-05

- [x] Ta bort `packages/config` (tom, sänkte type-check och lint för hela repot)
- [x] Ta bort `apps-backup/web` — 155 spårade filer, dubblett av webben
- [x] Ta bort `packages/shared` och `packages/ui` — `export {}`-stubbar
- [x] Ta bort rot-`api/` — två filer, refererades inte
- [x] Ta bort `build.cjs`, `build.js`, `build-simple.js`, `build-vercel.js` i rot
      och i `apps/web` — byte-identiska kopior av generatorn för tomma paket
- [x] Rotens `tsconfig.json` är en bas med `"files": []`, inte en allätare
- [x] `.eslintrc.js` → `.eslintrc.cjs`. Den lästes som ESM och kraschade
- [x] Rätta eslint-configen: `plugin:@typescript-eslint/recommended`, och bort
      med `prettier`-plugin som inte är installerat i något workspace
- [x] `--passWithNoTests` på web och api. `npm run test` går igenom nu
- [ ] **Åtgärda de 722 typfelen i `apps/web` och `apps/api`.** 273 av dem är
      oanvända variabler (TS6133). Ta bort `continue-on-error` på
      `Typkontroll (ärvd kod)` i `.github/workflows/ci.yml` när de är borta
- [ ] **Gör linten ren** — api 18 fel/459 varningar, web 33 fel/763 varningar.
      Ta bort `continue-on-error` på lint-steget när det är gjort
- [ ] **Bestäm om prettier ska in.** `.prettierrc` finns men paketet är inte
      installerat någonstans. Antingen installera det eller ta bort filen
- [ ] **Städa rotens 30 kvarglömda MD-filer.** 13 av dem påstår att projektet är
      produktionsredo. Se avsnittet längst ned
- [ ] **Städa rotens skalskript och demoservrar** — `build-*.sh`, `demo-server.js`,
      `simple-server.js`, `vercel.*.json` i tre varianter, `test-*.html`

---

## Fas 1 — Gör de fem länderna verkliga i gränssnittet ⛔ blockerar lansering

Kärnan kan hantera fem länder. **Appen kan det inte.** Det är skillnaden mellan
att kunna lansera i Kroatien och att bara påstå det.

- [ ] **Lägg till `bs` i ordboken.** Bosniska/kroatiska i latinsk skrift. Utan
      den går sidan inte att använda i två av fem marknader.
- [ ] **Flytta ordboken ur `i18n/config.ts`.** 592 rader i en fil med fyra språk
      inbakade blir ohanterlig vid fem. En fil per språk.
- [ ] **Härled `Dictionary` ur den svenska filen** så att en nyckel som glöms i
      något annat språk stoppar bygget. Utan det ruttnar översättningarna tyst.
- [ ] **Testa nyckelparitet** — identiska nyckelmängder åt alla håll, inga tomma
      strängar, språknamnen på sitt eget språk.
- [ ] **Byt ut hårdkodad svenska i JSX.** Bara 5 av komponenterna använder
      `useTranslation`; resten har texten inbakad. Det är den enskilt största
      posten i fas 1.
- [ ] **Ta bort hårdkodad `SEK` och `sv-SE`.** 42 filer nämner `SEK`. Priser ska
      formateras med `formatMoney()` och `intlLocaleFor(country)`.
- [ ] **Lägg landsväljare i annonsformuläret**, och låt landet styra valuta,
      momssats och organisationsnummerfält.
- [ ] **Koppla in `validateOrgNumber()`** i formuläret, med landets egen etikett
      (`orgNumberLabel`) och begripligt felmeddelande.
- [ ] **Språk i URL:en** för indexerade sidor (`/sv/...`, `/bs/...`) med
      hreflang enligt `alternateTags()`. Google indexerar en URL, inte en cookie.

---

## Fas 2 — Ersätt mockdatan ⛔ blockerar allt som rör riktiga annonser

- [ ] **Utöka Prisma-schemat.** Dagens 11 modeller saknar bud, sekretessavtal,
      dokument med åtkomstlogg, affärer och utbetalningar.
- [ ] **Lägg `country`, `currency` och belopp i minsta enhet på annonsen.**
      Belopp som `Int`, aldrig `Float` eller `Decimal` i mellanled.
- [ ] **Bygg ett servicelager** i webben som hämtar annonser från API:t.
- [ ] **Ta bort `mockListings`** ur `BusinessListingsPage.tsx`,
      `components/listings/BusinessListings.tsx`, `listings/ListingDetailPage.tsx`
      och `admin/EnhancedAdminPanel.tsx`. Alla fyra, samma commit — en kvarglömd
      kopia ser ut att fungera.
- [ ] **Bestäm vad som händer med de 30 demoannonserna.** Se `OPEN-QUESTIONS.md`,
      fråga 7.
- [ ] **Loading- och error-states** överallt där data hämtas. En tom lista och ett
      trasigt anrop ser likadana ut för användaren annars.

---

## Fas 3 — Välj bort den ena API-ytan

- [ ] **Bestäm: Express eller Vercel functions.** I dag finns båda och de gör
      delvis samma sak. WebSocket för meddelanden talar för Express.
- [ ] **Avveckla den andra.** Två API-ytor betyder två auth-implementationer och
      två ställen att glömma en behörighetskontroll på.
- [ ] **Samla valideringen i Zod-scheman** som delas mellan webben och API:t.

---

## Fas 4 — Säkerhet innan riktiga användare

- [ ] **Genomdriv åtkomstmatrisen i tre lager.** Se `SECURITY.md`. Middleware
      räcker aldrig ensamt för ett API.
- [ ] **Radnivåpolicy eller motsvarande i databasen** för varje tabell, innan den
      används.
- [ ] **Brute force-skydd på inloggning** — kontolåsning och per-IP-gräns.
- [ ] **CSP med nonce.** Börja i rapportläge, slå på när den är ren.
- [ ] **Oföränderlig logg** för åtkomst till due diligence-material. Triggers som
      blockerar UPDATE och DELETE.
- [ ] **Sekretessavtal före dokumentåtkomst**, genomdrivet i API:t och inte bara
      i gränssnittet.

---

## Fas 5 — Affären

Blockerad av `OPEN-QUESTIONS.md` frågorna 1–3. Bygg ingenting här förrän de har
svar.

- [ ] Budflöde där servern räknar och klienten bara kontrollerar
- [ ] Provision enligt beslutad modell — sats i konfiguration, inte i kod
- [ ] Fakturering med rätt momssats per land
- [ ] Utbetalning till säljaren

---

## Fas 6 — Drift

- [ ] **Verifiera att ett Vercel-projekt faktiskt bygger repot.** Lova aldrig en
      preview-URL du inte sett. Se `DEPLOYMENT.md`.
- [ ] Separata miljöer för `dev` och `main` med egna databaser
- [ ] Sentry med release-taggar och källkartor
- [ ] Backup och återställning, provad minst en gång
- [ ] Röktest som kör hela flödet mot en levande app

---

## Löpande

- [ ] Håll `main` och `dev` i takt. De gled isär till 114 commits en gång.
- [ ] Uppdatera `ARCHITECTURE.md` när något ändrar status. Ett dokument som
      ljuger om status är farligare än inget dokument alls.
- [ ] Skriv in svar i `OPEN-QUESTIONS.md` **innan** de skrivs in i kod.

---

## Rotens gamla MD-filer

`docs/` täcker det som behövs — tio filer, ett ämne per fil. Problemet är det
omvända: **30 MD-filer ligger kvar i roten från tiden före omstruktureringen**,
och 13 av dem påstår att projektet är produktionsredo. Enligt CLAUDE.md är ett
dokument som ljuger om status farligare än inget dokument alls.

Filerna, och vad de ersätts av:

| Rotfil | Ersätts av |
|---|---|
| `PRODUCTION_DEPLOYMENT.md`, `DEPLOYMENT_CHECKLIST.md`, `DEPLOYMENT_KOMMANDO.md`, `BEGINNER_DEPLOYMENT_GUIDE.md`, `SUPABASE_VERCEL_DEPLOYMENT.md`, `CLOUD_LÖSNING.md` | `docs/DEPLOYMENT.md` |
| `TESTING_CHECKLIST.md`, `TESTING_INSTRUCTIONS.md`, `TESTING_SUMMARY.md`, `TEST_GUIDE.md`, `TEST_LISTING_CREATION.md`, `TESTMILJÖ.md` | `docs/TESTING.md` |
| `SECURITY.md` (roten) | `docs/SECURITY.md`. Rotfilen beskriver DDoS-skydd som "implementerat"; rate limiting finns delvis, resten är inte verifierat |
| `DEVELOPMENT_WORKFLOW.md`, `GITHUB_SETUP_GUIDE.md`, `GITHUB_UPPLADNING.md`, `CLAUDE_CODE_PROMPT.md` | `CONTRIBUTING.md` + `CLAUDE.md` |
| `SETUP_COMPLETE.md`, `PREVIEW_IMPLEMENTATION_COMPLETE.md`, `SESSION_11_PROFESSIONAL_SERVICES_SETUP.md`, `COMPREHENSIVE_DEMO_GUIDE.md`, `DEMO_STARTUP_GUIDE.md`, `ANALYTICS_INTELLIGENCE_SETUP.md`, `SOCIAL_AUTH_LISTINGS_SETUP.md`, `TROUBLESHOOTING_GUIDE.md` | Inget. Ögonblicksbilder av sessioner som inte gäller längre |
| `.claude/current-tasks.md`, `.claude/guidelines.md`, `.claude/project-context.md`, `.claude/role-context.md` | `CLAUDE.md` + `docs/TODO.md`. 409 rader som konkurrerar med dem |

En MD-fil som behövs och **saknas**: ingen. `docs/` är komplett för nuläget.
`CHANGELOG.md` blir aktuell först när det finns releaser att beskriva.
