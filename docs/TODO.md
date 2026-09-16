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

## Fas 1 — Gör de tre nordiska länderna verkliga i gränssnittet ⛔ blockerar lansering

Lanseringen gäller SE, NO och DK (strategin omprövad 2026-09-15). Kärnan kan
hantera fem länder; **appen kan inte ens hantera tre** — den är svensk rakt igenom.

- [ ] **Lanseringsländer som konfiguration** — registrering, annonsformulär och
      filter erbjuder bara SE, NO och DK. Övriga länder i `@hansa/core` ligger
      kvar men visas inte
- [ ] **Ordböckerna `no` och `da` kompletta.** 2026-09-15 har `sv` och `en`
      runt 240 rader var i `config.ts`, `no` sju och `da` knappt tjugo. Norska
      och danska besökare ser i praktiken svenska
- [ ] **Flytta ordboken ur `i18n/config.ts`.** En fil per språk.
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
- [ ] **Språk i URL:en** för indexerade sidor (`/sv/...`, `/no/...`, `/da/...`)
      med hreflang enligt `alternateTags()`. Google indexerar en URL, inte en cookie.

---

## Fas 2 — Ersätt mockdatan ⛔ blockerar allt som rör riktiga annonser

Prisma-schemat ersattes av SQL-migrationerna i `supabase/` (fas 3). Land,
valuta och belopp i minsta enhet finns där.

- [x] **Servicelager i webben** — klart 2026-09-16. `services/listingService.ts`
      hämtar annonser ur Supabase och formaterar belopp med `@hansa/core`
- [x] **Demoannonserna i en källa** — klart 2026-09-16. Sex annonser i
      `supabase/seed.sql` med `is_demo = true`, inte längre kopior i komponenter
- [ ] **Gamla mockdata som är kvar**: dashboarden, meddelanden, notiser och
      värderingsverktyget. Annonssidorna är klara
- [x] ~~Bestäm vad som händer med de 30 demoannonserna.~~ Besvarat 2026-09-15:
      kvar, märkta. Se `OPEN-QUESTIONS.md`, fråga 7
- [x] **Märk demoannonserna "Exempelannons"** — klart 2026-09-16. Märkta i
      listan och på annonssidan, och kontaktrutan ersatt med en förklaring.
      Databasen nekar dessutom intresseanmälan på demoannonser (verifierat med
      ett anrop förbi gränssnittet: 403)
- [ ] **Inställning som stänger av demoannonserna** utan kodändring
- [ ] **Skapa annons sparar i databasen**, inte i `localStorage`
- [ ] **Meddelanden sparas i databasen**, inte i en array i minnet
- [x] **Loading- och error-states** på annonssidorna — klart 2026-09-16
      (laddning, fel med "Försök igen", tomt resultat med "Rensa filtren")
- [ ] **Loading- och error-states** på övriga sidor som hämtar data. En tom lista och ett
      trasigt anrop ser likadana ut för användaren annars.

---

## Fas 3 — Supabase som enda backend

Fas 2 och 3 flätas ihop i praktiken: annonserna kan inte hämtas från en databas
som inte finns. Ordningen här är den som går att bygga i.

- [x] ~~Bestäm: Express eller Vercel functions.~~ Besvarat 2026-09-15: Supabase +
      Vercel functions. Se `OPEN-QUESTIONS.md`, fråga 9
- [ ] **Skapa Supabase-projekt i EU** för dev, och senare ett för produktion.
      Väntar på Williams godkännande av kostnaden
- [ ] **Kontrollera innehållet i det gamla projektet** "123Hansa"
      (`pmtnrqtkuygyyodcovds`, `us-east-1`, pausat) innan det tas bort
- [x] **Schema v1 som SQL-migrationer** — klart 2026-09-15.
      `supabase/migrations/20260915120000_marketplace_v1.sql`: marknader,
      profiler, organisationer med medlemmar, annonser med granskning,
      intresseanmälningar, meddelanden, sekretessavtal med versioner, datarum
      med oföränderlig åtkomstlogg, bevakningar. RLS i samma migration som
      tabellen. 61 behörighetstester gröna mot lokal Postgres 17
- [ ] **Serverfunktion för dokumentåtkomst** — anropar `record_document_access()`
      och skapar en tidsbegränsad länk. Utan den kan loggen kringgås
- [ ] **Serverfunktion som verifierar organisationsnummer** med
      `validateOrgNumber()` ur `@hansa/core` och sätter `verified_at`
- [ ] **Bevakningarna ska skicka något** — matchning mot nya annonser och utskick
- [x] **Inloggning via Supabase Auth** — klart 2026-09-16. Registrering,
      inloggning och session provade i webbläsaren mot lokal databas
- [ ] **Ta bort `apps/web/api/`** — `auth.ts`, `listings.ts` och `messages.ts`
      är skal med mockdata som inte längre används av webben
- [ ] **Avveckla `apps/api`** när det som behövs är flyttat
- [ ] **Samla valideringen i Zod-scheman** som delas mellan webben och
      serverfunktionerna

---

## Fas 4 — Säkerhet innan riktiga användare

- [x] **Ta bort testinloggningarna** — klart 2026-09-15. `TestbedLogin`,
      `QuickLogin`, `QuickTestRegister`, `SimpleTestLogin`, `AdminLogin` och
      `TestListingSubmission` borta. ⚠️ Adminlösenordet ligger kvar i
      git-historiken i ett publikt repo och ska betraktas som röjt
- [ ] **Byt Sentry-token.** `.env.example` innehöll en riktig
      `SENTRY_AUTH_TOKEN` i det publika repot fram till 2026-09-16. Den ska
      betraktas som röjd och bytas i Sentry, precis som adminlösenordet
- [ ] **Skydda adminpanelen.** Tillfälligt löst 2026-09-15: `/kraken` och
      `/admin/dashboard` byggs bara in i utvecklingsläge. Riktig lösning är
      Supabase Auth med rollen kontrollerad på servern och i RLS
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

## Fas 4b — Rensa bort det som strider mot strategin

Strategin 2026-09-15 (`BUSINESS.md`): ren marknadsplats, avtal och betalning
sköts av parterna, crowdfunding i fas två. Webben innehåller i dag flera funktioner
som låtsas göra det plattformen uttryckligen inte ska göra.

- [x] **Ta bort "Lämna bud"** — klart 2026-09-15. Annonssidan har "Kontakta
      säljare" och "Visa intresse"; stegen på annonslistan omskrivna
- [x] **Ta bort Heart-kontrakten** — klart 2026-09-15. `/heart`,
      `components/heart/`, fliken i dashboarden och kryssrutan i
      annonsformuläret som krävde "Heart-avtal med escrow"
- [x] **Ta bort betalning av köpeskilling** — klart 2026-09-15. Betalkomponenterna
      var döda och togs bort med resten av den onåbara koden
- [x] **Ta bort crowdfunding** från meny, mobilknapp, rutter och ordbok — klart
      2026-09-15. Koden raderades i stället för att döljas; den byggde på mockdata
      och ska ändå skrivas om mot ECSP. Den finns i historiken före commiten som
      tog bort den
- [x] **Stryk formuleringar** som lovar förmedling, provision eller trygg
      betalning — klart 2026-09-15 i användarvillkor (`LegalPage`), hjälpsidan,
      annonsformuläret, startsidan, SEO-metadata och ordboken
- [x] **Ta bort påhittad social proof** — klart 2026-09-15. Startsidans
      "genomförda affärer", "3,2 miljarder SEK", kundomdömen, "SÅLD"-affärer,
      "BEGRÄNSAD TID – 12 bud senaste 48h", `/sales-demo`, "96,8 %
      framgångsgrad" och "500+ transaktioner" i värderingen. Påhittade omdömen
      och falsk brådska är förbjudna affärsmetoder enligt EU:s konsumentregler
- [ ] **Användarvillkoren behöver en jurist.** Avgiftsavsnittet är rättat, men
      texten i `LegalPage.tsx` är skriven utan juridisk granskning
- [x] **Värderingsschablonen** — klart 2026-09-16. `estimateValuation()` i
      `@hansa/core` med 13 tester, och en räknare på startsidan som visar
      spann, valuta per land och sina egna antaganden
- [ ] **Värderingstjänsten för 2 500 SEK** (`ValuationPage.tsx`) säljer en
      "professionell värdering från våra experter" som inte finns. Se
      `OPEN-QUESTIONS.md` fråga 15
- [ ] **Hämta bolagsuppgifter från officiella register** — adapter per land,
      anrop på servern. Se `OPEN-QUESTIONS.md` fråga 14. Skrapning av
      allabolag.se är uteslutet
- [ ] **Demoannonsernas texter** lovar "garanterade intäkter" och
      "marknadsledande". Skrivs om när de samlas i en källa och märks
      "Exempelannons" (fas 2)
- [ ] **Adminpanelens mockdata** (`AdminDashboard.tsx`, bara i dev) visar escrow,
      mäklararvode och crowdfunding-kampanjer. Försvinner när adminpanelen byggs
      om mot Supabase

---

## Fas 5 — Marknadsplatsens kärna

- [ ] **Köparprofiler** — sökkriterier: bransch, land, storlek, prisspann
- [ ] **Matchning** — bevakningar och utskick när en annons matchar en profil.
      Rangordning efter relevans, aldrig efter betald exponering
- [ ] **Intresseanmälan** — köparen visar intresse, säljaren väljer vem som går
      vidare. Kontaktuppgifter delas inte automatiskt
- [ ] **Datarum** — dokument i Supabase Storage bakom tidsbegränsade länkar,
      åtkomst först efter accepterat sekretessavtal, oföränderlig logg. Formen på
      avtalet: `OPEN-QUESTIONS.md` fråga 11
- [ ] **Meddelanden** mellan parterna, i realtid, sparade i databasen
- [ ] **Säkerställ gränsen:** inget bud, ingen köpeskilling, inget avtal där
      plattformen är part

## Fas 5b — AML och sanktionsscreening

Beslutad från start, se `BUSINESS.md`. Byggs **innan** första riktiga användaren
registreras — en användarmodell utan screening går inte att eftermontera utan att
screena alla befintliga i efterhand.

- [ ] **DPIA och post i `PERSONUPPGIFTER.md`** — före första screeningen
- [ ] Välj leverantör för sanktions- och PEP-listor
- [ ] Screening av person vid registrering, av bolag och verkliga huvudmän vid
      annons och vid köparprofil för bolag
- [ ] Omprövning när listorna uppdateras
- [ ] Manuell granskning av träffar i adminpanelen, med logg över beslutet
- [ ] En träff stoppar publicering och datarumsåtkomst, inte bara visar en varning

## Fas 5c — Intäkter

Blockerad av prisnivåerna i `OPEN-QUESTIONS.md` fråga 1.

- [ ] Listningsavgift, betald exponering och abonnemang — beräknade i
      `@hansa/core`, i landets valuta, med landets moms
- [ ] Märkning av betald exponering som annonserad
- [ ] Betalleverantör för avgifterna
- [ ] Fakturering med rätt momssats per land
- [ ] `calculateCommission()` i `pricing.ts` används inte längre av strategin.
      Ta bort den när avgiftsberäkningen ersatt den

## Senare skede — Kroatien, och köparsidan i Bosnien och Serbien

Inte före lansering. Strategin omprövad 2026-09-15: Norden först.

- [ ] **Lägg till `bs` i ordboken.** Bosniska/kroatiska i latinsk skrift
- [ ] **Kroatien (`HR`) i gränssnittet** — finns redan i `@hansa/core`
- [ ] **Serbien (`RS`) i `country.ts`** — valuta, tidszon, språk (`bs` täcker
      latinsk skrift), organisationsnummer med bara formatkontroll tills en
      kontrollsiffra bekräftats
- [ ] Registrering och screening av köpare från länder utan e-legitimation
- [ ] Märkning av annonser i sektorer där utländska direktinvesteringar kan
      granskas

---

## Fas 6 — Drift

- [ ] **Verifiera att ett Vercel-projekt faktiskt bygger repot.** Lova aldrig en
      preview-URL du inte sett. Se `DEPLOYMENT.md`.
      2026-09-15: båda projekten faller på Root Directory `apps/web`. William
      ändrar det i dashboarden
- [ ] **Ta bort Vercel-projektet `123hansa-staging`** — det bygger samma repo en
      gång till
- [ ] **Ta bort branchen `staging`** — den ingår helt i `dev`
- [ ] **Vercel Pro före lansering.** Hobby-planen är enligt Vercels villkor bara
      för icke-kommersiellt bruk
- [ ] Separata miljöer för `dev` och `main` med egna databaser
- [ ] Sentry med release-taggar och källkartor
- [ ] Backup och återställning, provad minst en gång
- [ ] Röktest som kör hela flödet mot en levande app

---

## Fas två — Crowdfunding som eget projekt

**Byggs inte i det här repot.** Byggs inte förrän bolaget är bildat och
ECSP-tillståndet är på väg. Se `BUSINESS.md` och `OPEN-QUESTIONS.md` fråga 6.

- [ ] Jurist med ECSP-erfarenhet, eget aktiebolag, ansökan om tillstånd
- [ ] Eget repo, eget varumärke, egen domän, eget Vercel-projekt och egen
      Supabase-databas. Inga delade användarkonton med marknadsplatsen
- [ ] Publicera `@hansa/core` som paket, så att crowdfunding-repot kan använda
      det utan att dela kod eller data med marknadsplatsen
- [ ] Skriv crowdfunding-flödet mot ECSP-kraven. Den gamla koden raderades
      2026-09-15 och finns i git-historiken om något ska återanvändas

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
