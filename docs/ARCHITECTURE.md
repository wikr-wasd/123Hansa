# Arkitektur

## Vad som faktiskt är byggt

Läs det här först. Repots tidigare dokumentation beskrev projektet som
"produktionsredo för 1000+ användare"; det stämde inte, och den som bygger vidare
på den beskrivningen bygger fel.

Status vid genomgången **2026-09-05**:

| Del | Läge | Kommentar |
|---|---|---|
| `@hansa/core` | 🟢 Klar och testad | 83 tester. Pengar, land, moms, provision, org.nr, språk |
| Webbens rutter | 🟡 Finns | Annonser, Min sida, meddelanden, datarum och granskning hämtar riktig data. `/notifications` är kvar på mockdata |
| Annonsdata | 🟢 Från databasen | Sedan 2026-09-16: `listingService.ts` mot Supabase. `mockListings` borta ur annonssidorna |
| API:ts rutter | 🔴 Avvecklas | `apps/api` är inte driftsatt och används inte. Se `OPEN-QUESTIONS.md` fråga 9 |
| Databasschema | 🟢 Byggt | SQL-migrationer i `supabase/` med RLS: organisationer, annonser, intresse, meddelanden, sekretessavtal, datarum, åtkomstlogg. 63 behörighetstester |
| i18n | 🟡 Delvis | `sv`, `en`, `no`, `da` i en fil. `bs` saknas. 5 komponenter använder den |
| Autentisering | 🟢 Supabase Auth | Registrering, inloggning och session. Granskarrollen ligger i `platform_admins` och kontrolleras i databasen |
| Betalning | 🔴 Inte beslutat | Stripe i package.json, ingen leverantör vald |
| Tester | 🟡 Delvis | 98 i `@hansa/core`, 63 behörighetstester mot databasen. `apps/web` har fortfarande inga |
| Typkontroll | 🟡 Delvis | `@hansa/core` ren. 722 äkta fel kvar i den ärvda koden i `apps/` |
| Lint | 🟡 Går att köra | api 18 fel/459 varningar, web 33 fel/763 varningar |
| Bygge | 🟢 Fungerar lokalt | `npm run build:web` går igenom |

🟢 klar · 🟡 påbörjat · 🔴 inte gjort

### Tillägg vid granskningen 2026-09-15

| Del | Läge | Kommentar |
|---|---|---|
| Vercel-bygget | 🔴 Faller | Båda projekten (`123-hansa-web`, `123hansa-staging`) har Root Directory `apps/web` och faller på `Missing script: "build:web"`. Produktion visar `main` från juli 2025 |
| Brancher | 🔴 Isär | `main` 116 commits efter `dev`. `staging` ingår helt i `dev` |
| Skapa annons | 🟢 Mot databasen | Organisation med kontrollerat organisationsnummer, annons, granskning |
| Meddelanden | 🟢 I databasen | Realtid, efter accepterad intresseanmälan |
| `/api/auth` | 🔴 Skal | Svarar bara "Auth API endpoint is working" |
| Express-API:t | 🔴 Ej driftsatt | Körs ingenstans. Avvecklas, se `OPEN-QUESTIONS.md` fråga 9 |
| Adminpanelen | 🟢 Ersatt | De mockade panelerna borta. `/admin/review` skyddas av `am_i_platform_admin()` och av databasen |
| Datarum | 🟢 Byggt | Sekretessavtal, dokument och oföränderlig åtkomstlogg. Nedladdning genom serverfunktion som loggar först |
| Databas | 🟡 Schema klart, inte i drift | `supabase/migrations/` med RLS och 61 gröna behörighetstester, körs lokalt i Docker. Molnprojektet "123Hansa" är pausat och ligger i `us-east-1` — ett nytt i EU skapas när William godkänt kostnaden |

### Städningen 2026-09-05

Fyra saker som såg ut som kod men bara var arv, och som gjorde CI omöjlig att
få grön, är borta:

- `packages/config` — bara en `package.json`, ingen `tsconfig.json`, ingen
  `src/`. Dess `tsc --noEmit` föll tillbaka på rotens tsconfig, som hade
  `"include": ["**/*"]` och drog in hela trädet med Node-lib men utan DOM.
  **25 960 typfel** kom därifrån. Samma paket dödade `npm run lint`.
- `apps-backup/web` — 155 spårade filer, en dubblett av webben. Låg kvar i
  historiken, men typkontrollerades som om den vore produktionskod.
- `packages/shared` och `packages/ui` — `export {}`-stubbar som inget importerar.
- `build.cjs`, `build.js`, `build-simple.js`, `build-vercel.js` i rot **och** i
  `apps/web` — byte-identiska kopior av generatorn som skapade de tomma paketen.
  Refererades inte längre av något efter att workspaces lagades.

Rotens `tsconfig.json` är nu en ren bas med `"files": []`. Varje workspace äger
sin egen `include`.

Två buggar i verktygskedjan som gjorde att linten aldrig kunnat köras:
`.eslintrc.js` lästes som ESM eftersom `package.json` har `"type": "module"`
(heter nu `.cjs`), och configen refererade `prettier`-plugin som inte är
installerat i något workspace samt `'@typescript-eslint/recommended'` utan
`plugin:`-prefix.

---

## Systemet

Beslutet 2026-09-15 (`OPEN-QUESTIONS.md` fråga 9). Byggt och provat lokalt;
ingenting av det är ännu driftsatt i molnet — se statustabellen ovan.

```
                 ┌───────────────────────────────┐
   Webbläsare ──▶│ apps/web  @123hansa/web       │  Vercel
                 │ React 18 + Vite + Tailwind    │
                 └──────┬─────────────────┬──────┘
          läsningar och │                 │ allt som räknar pengar
          egna rader    │                 │ eller byter status
          (RLS avgör)   │                 ▼
                        │   ┌───────────────────────────────┐
                        │   │ apps/web/api                  │  Vercel functions
                        │   │ avgifter · screening · datarum│
                        │   │ räknar med @hansa/core        │
                        │   └──────────────┬────────────────┘
                        ▼                  ▼
                 ┌───────────────────────────────┐
                 │ Supabase (EU)                 │
                 │ Postgres + RLS · Auth         │
                 │ Storage (datarum) · Realtime  │
                 └───────────────────────────────┘

        ┌──────────────────────────────────────────┐
        │ packages/core  @hansa/core               │
        │ Pengar · land · moms · provision · org.nr│
        │ INGEN runtime-koppling                   │
        └──────────────────────────────────────────┘
              ▲                            ▲
              └── används av web ──────────┘ och av api
```

Klienten får läsa och skriva direkt mot Supabase **bara** där radnivåpolicyn
ensam räcker som skydd — egen profil, egna utkast, egna meddelanden. Allt som
flyttar värde eller ändrar en affärs status går genom en serverfunktion, eftersom
regel 2 i `CLAUDE.md` säger att klienten aldrig skickar ett pris.

`apps/api` (Express + Prisma) finns kvar i repot tills det som behövs ur det har
flyttats. Det är inte driftsatt och ska inte byggas vidare på.

---

## `@hansa/core` — den viktigaste regeln

Paketet får **aldrig** importera från React, Express, Prisma, Vite eller någon
annan runtime. Det ska kunna köras var som helst: i webben, i API:t, i ett skript
och i en framtida mobilapp.

Det är därför reglerna ligger där i stället för i komponenterna. En provisionssats
som räknas i en React-komponent kan inte återanvändas av API:t, och två kopior av
samma uträkning glider isär — då visar sidan en summa servern räknar annorlunda,
och affären avbryts med "priset har ändrats" utan att någon förstår varför.

| Modul | Ansvar |
|---|---|
| `money.ts` | Heltal i minsta enhet. Addition, allokering, baspunkter, formatering, inläsning |
| `country.ts` | De fem marknaderna: valuta, moms, tidszon, språk, EU-tillhörighet |
| `locale.ts` | Språkval, `Accept-Language`-förhandling, hreflang |
| `vat.ts` | Moms på och ur ett belopp. Vägrar en sats som inte gäller i landet |
| `orgnumber.ts` | Kontrollsiffror för SE, NO, DK, HR. Formatkontroll för BA |
| `pricing.ts` | Provision. Satsen är ett **argument**, inte en konstant |

---

## Dataflödet på marknadsplatsen

Så här ska det se ut enligt strategin 2026-09-15 (`BUSINESS.md`). Steg 1 och 3–6
är byggda mot databasen. Screeningen av **bolag** i steg 2 är byggd sedan
2026-09-17, men utan listleverantör — se nedan. Screeningen av person och
verklig huvudman finns inte, och avgifterna i steg 1 väntar på prisbeslut.

1. **Säljaren skapar en annons** och betalar listningsavgiften. Land väljs, och
   landet avgör valuta, moms och vilket organisationsnummerformat som krävs.
   Numret valideras mot rätt lands algoritm. Avgiften räknas på servern — regel 2.
2. **Säljaren, bolaget och dess verkliga huvudmän screenas**, och annonsen
   **granskas** innan den publiceras. En träff stoppar publiceringen.
3. **Köparen screenas** vid registrering och får **matchningar** mot sin
   köparprofil. Betald exponering märks och påverkar aldrig matchningens
   rangordning.
4. **Köparen visar intresse.** Kontaktuppgifter delas inte automatiskt; säljaren
   väljer vem som går vidare.
5. **Köparen accepterar sekretessavtalet** — parternas avtal, inte plattformens.
   Vem, vilken version och när loggas oföränderligt.
6. **Datarummet öppnas.** Dokument via tidsbegränsade länkar, varje åtkomst
   loggad oföränderligt.
7. **Parterna fortsätter själva** — förhandling, avtal och betalning sker utanför
   plattformen. Säljaren markerar annonsen som såld eller tillbakadragen.

Här tar plattformens ansvar slut. **Det finns inget steg 8.** Ett bud, en
köpeskilling eller ett avtal där plattformen är part kräver ett nytt beslut i
`OPEN-QUESTIONS.md`, eftersom det flyttar 123Hansa mot förmedlarrollen.

### Screeningen i steg 2 — vad som finns och vad som inte gör det

Migrationen `20260917100000_screening.sql` och `/admin/screening` bygger
*apparaten*: kontroller, beslut med tvingande motivering, oföränderlig logg och
— avgörande — en **konsekvens**. `verify_organization()` vägrar när läget är
`hit`, `blocked` eller `pending`, och en overifierad organisation kan inte
publicera. Kedjan är provad i webbläsaren och i `screening.test.sql`.

Det som **inte** finns är själva listuppslaget. `screening-run` har bara
leverantören `manual`, som aldrig svarar `clear` utan lämnar ärendet åt en
människa. Det är avsiktligt: en kontroll som säger "inget att anmärka" utan att
ha frågat någon ser ut som ett bevis, och är farligare än ingen kontroll alls.

Tre saker måste alltså vara sanna samtidigt innan någon säger att 123Hansa
screenar: leverantör upphandlad, DPIA genomförd med jurist, och personer och
verkliga huvudmän screenade — inte bara bolaget.

---

## Åtkomstkontroll i tre lager

Detaljerna står i `SECURITY.md`. Principen hör hemma här:

1. **Klienten** döljer det användaren inte får se. Det är UX, inte säkerhet.
2. **API:t** verifierar rollen server-side i varje route. Middleware räcker
   **aldrig** ensamt.
3. **Databasen** har radnivåpolicy eller motsvarande begränsning.

Inget lager får tas bort. Lärdomen kommer från 123Connect, där just den regeln
skrevs in efter att ett API-anrop visat sig gå förbi middleware.

---

## Skulder som är kända och medvetna

**Två API-ytor.** `apps/api` (Express) och `apps/web/api` (Vercel functions) gör
delvis samma sak. **Beslutat 2026-09-15:** Express avvecklas till förmån för
Supabase + Vercel functions. Realtid för meddelanden, som var skälet att behålla
Express, tas av Supabase Realtime.

**Mockdata i komponenter.** `mockListings` finns i fyra filer och i två
Vercel-funktioner. **Beslutat 2026-09-15:** annonserna ligger kvar som märkta
demoannonser (`OPEN-QUESTIONS.md` fråga 7), men i en enda källa och utan
möjlighet att kontakta eller buda.

**Två scheman samtidigt.** Prisma-schemat i `apps/api/prisma/` är från det
Express-API som avvecklas, och används inte av något som körs. Det nya schemat är
SQL-migrationer i `supabase/migrations/`. Prisma-schemat tas bort med resten av
`apps/api`.

Det som ännu saknas i det nya schemat: screeningresultat (fas 5b, kräver DPIA
först) och avgifter (fas 5c, kräver prisbeslut). Bud, affärer och utbetalningar
ska **inte** finnas — se `BUSINESS.md`. Det nya schemat skrivs som SQL-migrationer för
Supabase, med RLS i samma migration som tabellen.

**Ingen testtäckning utanför core.** Route handlers och komponenter har i
praktiken inga tester. Se `TESTING.md` för vad som ska testas var.

**i18n är inte genomdriven.** Fyra språk finns i en enda fil på 592 rader, `bs`
saknas, och bara fem komponenter använder ordboken. Resten har svensk text
inbakad i JSX:en — vilket gör att sidan inte går att använda i Kroatien eller
Bosnien oavsett vad ordboken innehåller.

---

## Beslut som formade arkitekturen

**Varför `@hansa/core` och inte en `utils`-mapp per app.** Två appar som var för
sig implementerar provision, moms och valutaformatering ger två sanningar. Ett
paket utan runtime-beroenden ger en, och den går att testa på 400 ms utan
databas.

**Varför pengar är heltal.** Flyttal ackumulerar fel. På en affär om tiotals
miljoner är felet inte teoretiskt, och ett kvitto som inte går ihop på öret är ett
kvitto ingen litar på.

**Varför landet och inte språket styr formatering.** En svensk som läser sidan på
engelska ska ändå se en kroatisk annons i euro med kroatisk sifferformatering,
eftersom annonsen är kroatisk. Språk och land är två olika saker.

**Varför `bs` täcker både Bosnien och Kroatien.** Skillnaden i latinsk skrift är
ordval, inte grammatik. Två nästan identiska ordböcker glider isär på den nyckel
någon glömmer i den ena. Systerprodukten Burp gjorde samma val efter att ha
prövat alternativet.
