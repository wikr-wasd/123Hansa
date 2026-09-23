# Claude Code — projektkontext för 123Hansa

## Arbetssätt: ifrågasätt och var ärlig

Claude ska INTE blint bygga allt som efterfrågas. Om en begäran är

- tekniskt omöjlig eller orealistisk,
- en dålig idé ur ett UX-, säkerhets- eller arkitekturperspektiv,
- baserad på ett felaktigt antagande,

så ska Claude **säga det rakt ut, förklara varför och föreslå ett bättre
alternativ** i stället för att tyst implementera det.

William har uttryckligen sagt: "jag har inte alltid rätt." Att invända
respektfullt och motivera är önskat, inte oartigt. Ställ hellre en klargörande
fråga än att gissa. Slutbeslutet är alltid Williams, men det ska vara informerat.

Rapportera faktiskt utfall. Misslyckas något, säg det med utdata i stället för
att beskriva det som klart. Den regeln har en dyr historia i just det här repot —
se "Vad som faktiskt är byggt" nedan.

---

## Grundregel: inga halvfärdiga skal

Varje sida och komponent ska vara fullt implementerad. Inga placeholders, inga
döda knappar, ingen TODO som skickas som klar.

- Alla knappar har fungerande handlers
- Alla länkar leder någonstans
- Alla formulär kan skickas och sparar data
- Alla API-anrop har både success- och error-hantering
- All data kan skapas, läsas, uppdateras och tas bort
- Loading states och feedback överallt
- Destruktiva åtgärder kräver bekräftelse
- Responsiv design är obligatorisk

---

## Vad 123Hansa är

En **M&A-marknadsplats**: annonser för hela bolag och affärstillgångar,
matchning mellan köpare och annonser, betald exponering och datarum med
sekretess. Strategin beslutades 2026-09-15 och står i `docs/BUSINESS.md`.

**Plattformen är inte part i affären.** Den förhandlar inte, tar inget bud, håller
inga pengar och upprättar inga avtal — det sköter köpare och säljare själva. Den
gränsen är det som gör att marknadsplatsen kan starta utan tillstånd. Bygg
**aldrig** en funktion som korsar den (budflöde, avgift per avslut, escrow,
andelar till många investerare) utan ett uttryckligt beslut i
`docs/OPEN-QUESTIONS.md`.

Intäkterna är listning, betald exponering och abonnemang. **Aldrig success fee** —
en avgift på genomförd affär drar plattformen mot förmedlarrollen.

Lanseringen sker i **Sverige, Norge och Danmark**. Kroatien, och Bosnien och
Serbien som köparsida, kommer i ett senare skede. `@hansa/core` behåller alla
fem länderna; det är gränssnittet och registreringen som bara erbjuder SE, NO
och DK vid lansering.

**Crowdfunding är ett eget projekt** — eget bolag, eget repo, egen databas, egen
domän — med ECSP-tillstånd. Det byggs aldrig in i det här repot.

AML- och sanktionsscreening av användare, bolag och verkliga huvudmän byggs från
start, även utan skyldighet. Datarummet och screeningen har högst kvalitetskrav i
produkten, för det är där ansvaret finns.

| Dokument | Innehåll |
|---|---|
| `docs/TODO.md` | **Arbetslistan. Följ den uppifrån** |
| `docs/ARCHITECTURE.md` | Systemarkitekturen, och vad som faktiskt är byggt |
| `docs/COUNTRIES.md` | De fem marknaderna: valuta, moms, org.nr, språk, register |
| `docs/OPEN-QUESTIONS.md` | Beslut som blockerar. Gissa dem inte i kod |
| `docs/SECURITY.md` | Förtroendegränserna och åtkomstmatrisen |
| `docs/DEPLOYMENT.md` | Miljöer och driftsättning |
| `docs/PERSONUPPGIFTER.md` | GDPR: vad som samlas in, var det ligger, vem det delas med |
| `docs/TESTING.md` | Vad som testas var, och vad ett grönt test faktiskt bevisar |
| `docs/BUSINESS.md` | Affärsmodellen och villkoren för en ny marknad |
| `docs/DESIGN.md` | Designspråket |

---

## Vad som faktiskt är byggt

Läs det här stycket innan du lovar något åt William.

Repots historia innehåller flera dokument som beskrev projektet som
"produktionsredo för 1000+ användare". **Det stämde inte.** Vid genomgången
2026-09-05 gällde följande:

- Annonserna på webben kommer ur **hårdkodad mockdata** i komponenterna —
  `mockListings` finns i minst fyra filer, bland annat
  `apps/web/src/pages/BusinessListingsPage.tsx` och
  `components/listings/BusinessListings.tsx`. API:t anropas inte för dem.
- Det fanns **262 träffar** på `TODO`, `FIXME`, `placeholder` och `coming soon`
  i `apps/web/src` och `apps/api/src`.
- Prisma-schemat hade **11 modeller**, vilket inte räcker för budgivning,
  sekretessavtal, due diligence eller utbetalningar.
- Bygget på Vercel gick genom `build.cjs`, ett skript som **genererade tomma
  paket** (`packages/shared`, `packages/ui` med `export {}`) vid varje bygge för
  att workspace-uppsättningen var trasig.

Skriv aldrig att något är produktionsklart för att ett tidigare dokument påstår
det. Kontrollera i koden. Ett dokument som ljuger om status är farligare än inget
dokument alls, eftersom nästa läsare bygger vidare på lögnen.

---

## Struktur

```
123Hansa/
├── apps/
│   ├── web/              @123hansa/web — React 18 + Vite + Tailwind
│   │   ├── src/
│   │   └── api/          Vercel serverless functions
│   └── api/              @123hansa/api — Express + Prisma + PostgreSQL
│       └── prisma/       schema.prisma, migrations
├── packages/
│   └── core/             @hansa/core — delad affärslogik, ingen runtime-koppling
├── docs/
├── scripts/
└── .github/workflows/
```

`@hansa/core` får **aldrig** importera från React, Express, Prisma, Vite eller
någon annan runtime. Paketet ska kunna köras var som helst — i webben, i API:t, i
ett skript och i den mobilapp som ännu inte finns. Det är hela poängen med att
lägga reglerna där i stället för i en komponent.

---

## Kommandon

```bash
npm install                # rot — installerar alla workspaces
npm run dev                # api + web parallellt
npm run dev:web            # webben på :3002
npm run dev:api            # API:t

npm run test:core          # affärslogiken — snabb, kräver ingenting
npm run test               # alla workspaces
npm run type-check
npm run lint
npm run build

npm run verify             # type-check + lint + test + build. Kör den före leverans
```

---

## Regler som inte får brytas

### 1. Pengar är heltal i valutans minsta enhet

Aldrig float, aldrig `numeric` i schemat, aldrig hela valutaenheter i mellanled.
12,00 SEK är `1200`. Konvertera först vid presentation, med `formatMoney()`.

`CURRENCY_INFO[...].decimalDigits` avgör skalan — **hårdkoda aldrig division med
100.** Alla fem marknaderna har i dag två decimaler, men mekanismen finns för att
regeln ska hålla när den inte längre gör det. Systerprodukten Burp har redan
träffat på serbiska dinarer, som har noll.

Procentsatser är baspunkter: 340 = 3,40 %.

**Belopp i olika valutor summeras aldrig.** `add()` kastar på försöket. En
plattformsöversikt som lägger ihop BAM och SEK till "total omsättning" ljuger,
och siffran går inte att felsöka i efterhand. Redovisa per valuta.

### 2. Klienten skickar aldrig ett pris

Servern hämtar annonsens pris och räknar med `@hansa/core`. Skickar klienten sin
egen summa används den bara som kontroll — `verifyClientTotal()` — och avviker
den **avbryts affären, den justeras aldrig tyst**. En tyst justering döljer
antingen en bugg i klienten eller ett manipulationsförsök, och båda ska synas.

Samma regel gäller allt som ändrar summan: klienten skickar en rabattkod, aldrig
rabatten.

### 3. Priset räknas på ett enda ställe

`packages/core/src/pricing.ts`. Duplicera aldrig prislogik i en komponent, en
route handler eller en SQL-vy. Två kopior glider isär, och då visar sidan en
summa servern räknar annorlunda.

### 4. Landet avgör, inte koden

Land är en egenskap hos annonsen och hos användaren. Valuta, momssatser,
organisationsnummerformat, tidszon och standardspråk följer av landet och bara av
landet. Allt ligger i `packages/core/src/country.ts`.

Skriv **aldrig** in `SEK`, `Sverige` eller `sv-SE` i en komponent. Läs landets
uppgifter. Se `docs/COUNTRIES.md` för hela tabellen.

Att Bosnien och Danmark har en enda momssats är avsiktligt, inte en lucka.

**Valutan ska frysas på affären.** Ett avslut ändrar sig aldrig i efterhand för
att en växelkurs rört sig.

### 5. Ny tabell = ny RLS-policy eller motsvarande behörighetskontroll, alltid

Innan tabellen används. Åtkomstkontrollen ska finnas i **tre lager** — klient,
API och databas — och inget lager får tas bort. Middleware räcker ALDRIG ensamt
för att skydda ett API. Se `docs/SECURITY.md`.

### 6. Due diligence-material är det känsligaste vi lagrar

Årsredovisningar, kundlistor och avtal för ett bolag som är till salu är
information som skadar säljaren om den läcker — även till en konkurrent som bara
låtsas vara köpare. Åtkomst kräver signerat sekretessavtal och loggas. Loggen är
oföränderlig.

### 7. Organisationsnummer valideras mot rätt lands algoritm

`validateOrgNumber(input, country)`. Fyra av fem länder har kontrollsiffra och
den kontrolleras. **Bosniskt JIB har bara formatkontroll** — någon offentligt
publicerad kontrollsiffra har inte kunnat bekräftas, och att gissa en algoritm
vore värre än att avstå: ett felaktigt avvisat nummer stänger ute en riktig
säljare, och det syns aldrig i loggarna eftersom hen bara ger upp.

Formatkontroll är inte detsamma som att företaget finns. Registeruppslag är en
öppen fråga — se `docs/OPEN-QUESTIONS.md`.

### 8. Prisnivåerna är inte beslutade — hårdkoda dem inte

Modellen är beslutad (listning, exponering, abonnemang, ingen success fee).
**Nivåerna** är det inte. Det finns ingen prislista i kodbasen och ska inte finnas
någon förrän beloppen är skrivna i `docs/OPEN-QUESTIONS.md`, fråga 1. Då hör de
hemma i konfiguration, inte i en komponent.

`calculateCommission()` i `pricing.ts` är från den tidigare modellen och ska inte
kopplas in någonstans.

---

## Språk

Fem språk, fem länder — men **inte ett språk per land**.

| Kod | Täcker | Standard i |
|---|---|---|
| `sv` | Svenska. Standardspråk, och det ordboken härleds ur | SE |
| `no` | Norsk bokmål | NO |
| `da` | Danska | DK |
| `bs` | Bosniska och kroatiska i **latinsk** skrift | BA, HR |
| `en` | Alla andra, och internationella köpare | — |

`bs` är **en** ordbok och inte två. Skillnaden mellan standarderna i latinsk
skrift är ordval, inte grammatik, och två nästan identiska filer glider isär på
den nyckel någon glömmer i den ena. Den som söker på kroatiska i Zagreb hittar
ändå sidan: `alternateTags('bs')` märker sidan med `hreflang` för `bs`, `hr`
**och** `sr-Latn`. Serbiskan märks `sr-Latn` med flit — ett omärkt `sr` lovar
kyrilliska.

`hr`, `sr`, `nb` och `nn` är **alias i `Accept-Language`, aldrig adresser**. En
kroatisk telefon landar på `bs` utan att `/hr/` finns. Att ge dem egna URL:er
hade gett Google samma innehåll på två adresser.

**Språk och land är två olika saker.** En svensk som läser sidan på engelska ska
ändå se en kroatisk annons i euro med kroatisk sifferformatering, eftersom
annonsen är kroatisk. Därför avgör `intlLocaleFor(country)` formateringen och
språket bara texten.

**Bara gränssnittet översätts.** Säljarens egen text — bolagsbeskrivning,
verksamhet, villkor — står kvar som den skrivits. En maskinöversatt
bolagsbeskrivning i en affär på tiotals miljoner är en juridisk risk, inte en
tjänst.

⚠️ **Nuläge:** ordböckerna i `apps/web/src/i18n/config.ts` innehåller `sv`, `en`,
`no` och `da`. `bs` saknas, och bara fem komponenter använder `useTranslation`.
Se `docs/TODO.md`.

---

## Deploy-flöde: dev → godkännande → main

`dev` är standardarbetsbranchen. `main` är produktion.

1. **Allt arbete sker på `dev`.** Committa och pusha löpande.
2. Varje push till `dev` ska ge en preview-deploy som William får URL:en till.
   ⚠️ Kontrollera att ett Vercel-projekt faktiskt bygger repot innan du lovar en
   URL. Lova aldrig en preview du inte sett. Se `docs/DEPLOYMENT.md`.
3. **Först när William uttryckligen godkänt** preview:n:
   ```bash
   git checkout main && git merge dev --ff-only && git push origin main && git checkout dev
   ```
4. Committa **aldrig** direkt på `main`.
5. Kontrollera `git status` och `git log @{u}..` vid sessionsstart och slut.

⚠️ Deploya **aldrig** till produktion utan Williams uttryckliga godkännande.

**Historisk fälla:** `main` och `staging` gled isär till 114 commits under 2025
utan att någon märkte det, medan `main` var default-branch och `staging` bar all
ny kod. Den som läste `main` läste fel projekt. Håll brancherna i takt eller slå
ihop dem — låt dem aldrig ligga och glida.

---

## Innan du säger att något är klart

```bash
npm run verify    # type-check + lint + test + build
```

Ett grönt `npm run test` bevisar att **affärslogiken** stämmer. Det bevisar
ingenting om att sidan hämtar sin data från API:t, att en RLS-policy har sin
GRANT eller att en knapp gör något. Se `docs/TESTING.md` för vad som testas var.

**Ett grep av HTML:en bevisar ingenting.** Felpayloader innehåller ändå de
strängar man letar efter. Läs HTTP-statusen.

---

## Fällor på den här maskinen

### Git Bash behöver PATH satt först

Utan `/usr/bin` på `PATH` finns varken `ls`, `grep` eller `curl`, och den som
provar drar slutsatsen att skalet är trasigt.

```bash
export PATH="/usr/bin:/bin:/mingw64/bin:/c/Program Files/nodejs:$PATH"
```

`curl` ligger i `/mingw64/bin`, inte i `/usr/bin`.

### `gh` CLI finns inte, och behövs inte

MSI-installationen kräver admin, vilket inte finns på maskinen. Det spelar ingen
roll: **Git Credential Manager har redan Williams GitHub-inloggning**
(`wikr-wasd`), så `git clone`, `commit` och `push` fungerar direkt. Uppslag mot
GitHub API går att göra oautentiserat mot publika repon.

### PowerShell och UTF-8

`Get-Content -Raw` mojibake:ar svenska tecken. Använd
`[System.IO.File]::ReadAllText(path, UTF8)` — eller Git Bash, vilket är det som
används genomgående här.

### Databastesterna kräver Docker Desktop, som inte ligger i Program Files

`npm run test:db` startar en lokal Postgres i Docker. Är Docker Desktop inte
igång faller `supabase status` med `failed to connect to the docker API at
npipe:////./pipe/dockerDesktopLinuxEngine`, vilket läser som att Supabase är
trasigt. Programmet ligger inte där man letar:

```bash
"$LOCALAPPDATA/Programs/DockerDesktop/Docker Desktop.exe"   # inte Program Files
```

Starta det, vänta tills `docker info` svarar, och kör sedan `npm run db:reset`
innan `npm run test:db` — annars testas gårdagens schema.

### Öppna appen på `localhost`, aldrig på `127.0.0.1`

Vite-servern är satt till `strictPort` på 3002. Vissa resurser blockeras för en
värd som inte står i konfigurationen, och följden är att sidan renderas men
aldrig blir klickbar — vilket läser som ett produktfel.
