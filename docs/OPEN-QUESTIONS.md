# Öppna frågor

Beslut som blockerar bygget. **Gissa dem inte i kod.**

Ett antagande som skrivs in i en komponent blir osynligt inom en vecka och
kostar en omskrivning inom en månad. Det som står här är medvetet obesvarat i
kodbasen: provisionssatsen är ett argument, inte en konstant, och
momshanteringen vid gränsöverskridande affär är inte implementerad alls.

Besvarade frågor flyttas längst ned, med datum och motivering.

När en fråga får sitt svar: skriv in svaret **här**, med datum, och först
därefter i koden.

Ansvarig för besluten är William. Frågorna är sorterade efter hur mycket de
blockerar.

---

## 1. Provisionsmodellen ⛔ blockerar intäkter

**Frågan:** Vad tar 123Hansa betalt, och på vad?

Delfrågor som måste besvaras tillsammans:

- Procentsats, eller fast avgift, eller trappa efter affärens storlek?
- Räknas provisionen på **slutpriset** eller på **utropspriset**?
- Finns en lägsta provision? Ett tak? En affär på 50 miljoner med 3,4 % ger
  1,7 miljoner i provision, vilket ingen säljare accepterar utan tak.
- Betalar **säljaren**, **köparen** eller båda?
- Tas något ut **i förskott** (annonsavgift) eller bara vid avslut?
- Vad händer om affären avbryts efter att bud accepterats?

**Läge i koden:** `calculateCommission()` i `packages/core/src/pricing.ts` tar
`rateBasisPoints`, `minimumFee` och `maximumFee` som argument. Det finns **ingen
prislista någonstans i kodbasen** och ska inte finnas någon förrän frågan är
besvarad.

**Varför det inte går att gissa:** en provisionsmodell är det som avgör om
säljare överhuvudtaget lägger upp sitt bolag. Fel modell märks inte som en bugg —
den märks som att ingen använder tjänsten.

**Status:** ⬜ obesvarad

---

## 2. Betalning och escrow ⛔ blockerar avslut

**Frågan:** Hur flyttas pengarna, och vem håller dem under affären?

- Vilken betalleverantör? Stripe finns i `package.json` sedan tidigare men täcker
  inte de fem marknaderna lika — Bosnien i synnerhet.
- Håller 123Hansa **klientmedel** (escrow), eller sköts köpeskillingen helt
  utanför plattformen mellan parternas banker och jurister?
- Om escrow: reglerna för att hålla annans pengar skiljer sig kraftigt mellan de
  fem länderna, och kan kräva tillstånd. Bosnien är strängast.
- Tas provisionen ur köpeskillingen, eller faktureras den separat?

**Varför det är stort:** svaret avgör om 123Hansa är en annonsplats eller en
finansiell aktör. Det andra kräver tillstånd, kapitalkrav och penningtvättsrutiner
i fem jurisdiktioner.

**Rekommendation att ta ställning till:** börja utan escrow. Fakturera
provisionen separat mot signerat avslut. Escrow kan läggas till; ett tillstånd
kan inte tas tillbaka.

**Status:** ⬜ obesvarad

---

## 3. Verifiering av säljare och bolag ⛔ blockerar förtroende

**Frågan:** Hur vet en köpare att säljaren äger det hen säljer?

- Ska organisationsnummer slås upp mot register, eller räcker formatkontroll?
  (Se `COUNTRIES.md` för register per land.)
- Vem betalar för uppslagen? Flera av registren tar betalt per anrop.
- **Bosnien saknar kontrollsiffra på JIB** och är dessutom administrativt delat i
  Federationen, Republika Srpska och Brčko med egna register. Ett uppslag där är
  inte ett API-anrop, det är tre.
- Krävs BankID (SE), BankID (NO), MitID (DK) för att lägga upp en annons? De tre
  är olika system trots namnen. Kroatien och Bosnien har inga motsvarigheter med
  samma täckning.
- Hur verifieras en säljare i Bosnien och Kroatien, när e-legitimation saknas?

**Varför det inte går att gissa:** en marknadsplats för bolagsaffärer utan
verifiering blir en bedrägeriplattform. Men ett verifieringskrav som bara går att
uppfylla i Norden stänger ute två av fem marknader.

**Status:** ⬜ obesvarad

---

## 4. Moms på provisionen vid gränsöverskridande affär

**Frågan:** Vilken moms fakturerar 123Hansa, till vem?

- En svensk säljare, en norsk köpare, ett bolag i Kroatien — vem faktureras och
  med vilken sats?
- Omvänd skattskyldighet gäller B2B mellan EU-länder. Norge och Bosnien står
  utanför EU. `COUNTRY_INFO.inEu` finns i koden för att frågan ska gå att ställa,
  men svaret är inte inlagt.
- Var är 123Hansa etablerat? Det avgör grundfallet, och det är inte dokumenterat
  någonstans i repot.
- Krävs momsregistrering i flera av länderna?

**Läge i koden:** `addVat()` kräver en sats som är tillåten i landet och vägrar
alla andra. Vilket land som gäller vid en gränsöverskridande affär är inte
implementerat.

**Detta är en revisorsfråga, inte en utvecklarfråga.**

**Status:** ⬜ obesvarad

---

## 5. Är bolagsöverlåtelsen i sig momspliktig?

I flera av länderna är en verksamhetsöverlåtelse undantagen från moms. Det
påverkar inte vår provision — den är en tjänst — men det påverkar vad
plattformen får visa och påstå om priser, och om ett annonspris ska anges med
eller utan moms.

Ska ett utropspris visas **exklusive** moms som standard? För fastigheter och
inventarier blir svaret ett annat än för aktier i ett bolag.

**Status:** ⬜ obesvarad

---

## 6. Crowdfunding: vilken sorts?

✅ **Besvarad 2026-09-15** — se "Besvarade frågor" längst ned. Kvar att besvara
är delfrågan om pengarna, som hänger ihop med fråga 2.

---

## 7. Vad händer med den befintliga mockdatan?

✅ **Besvarad 2026-09-15** — se "Besvarade frågor" längst ned.

---

## 8. Vilken branch är sanningen?

`main` och `staging` gled isär till 114 commits under 2025. `main` var
default-branch, `staging` bar all ny kod.

Frågan är egentligen redan besvarad av verkligheten — `staging` är nyare — men
beslutet att göra om `main` behöver tas uttryckligen, eftersom det skriver om
vad besökare på GitHub ser.

**Status:** 🟡 föreslagen: gör om `main` till `staging`s innehåll och arbeta
vidare enligt `dev → godkännande → main`. Väntar på Williams ja.

---

## Besvarade frågor

När en fråga besvaras flyttas den hit med datum och motivering — inte bara med
svaret. Motiveringen är det som gör att beslutet går att ompröva när
förutsättningarna ändras.

### 6. Crowdfunding: reward-based — 2026-09-15, William

**Beslut:** crowdfunding på 123Hansa är **reward-based**: stödjare förköper en
produkt eller tjänst, eller får en belöning. Inga andelar, inga lån.

**Motivering:** equity crowdfunding kräver tillstånd som
gräsrotsfinansieringsplattform (ECSP i EU, Finansinspektionen i Sverige, egna
regimer i Norge och Bosnien) och hade blockerat lansering oavsett hur klar koden
var. Lånebaserad är ännu en regim.

**Det här beslutet löser inte:**

- **Vem som håller pengarna** mellan löfte och utbetalning. Håller 123Hansa
  stödjarnas pengar är det samma escrow-fråga som fråga 2. Kampanjer med
  "allt eller inget" kräver att någon håller eller reserverar beloppet.
- **Konsumentskydd.** Stödjare är ofta privatpersoner. Ett förköp är ett
  distansavtal, med ångerrätt och informationskrav som skiljer sig mellan de fem
  länderna.
- **Gränsen mot equity.** En kampanj som i praktiken lovar avkastning är inte
  reward-based för att den heter så. Granskningen av kampanjer måste fånga det.

**Konsekvens i koden:** kampanjer får inga fält för andelar, värdering per andel
eller avkastning. Crowdfunding-flödet byggs efter annonsflödet (steg 5 i
`TODO.md`), och betalningsdelen väntar på fråga 2.

### 7. Demoannonserna: kvar, tydligt märkta — 2026-09-15, William

**Beslut:** de 30 påhittade annonserna **ligger kvar som demo** i stället för att
tas bort.

**Motivering:** en marknadsplats som är tom vid start visar inte vad tjänsten gör.

**Villkor som följer av beslutet**, eftersom rekommendationen var den motsatta och
risken — en besökare som hör av sig om ett bolag som inte finns — kvarstår:

- Varje demoannons märks **"Exempelannons"** överallt där den visas: i listan, på
  annonssidan och i sökträffar. Märkningen är inte en diskret etikett i hörnet.
- En demoannons **går inte att kontakta, buda på eller begära sekretessavtal för.**
  Knapparna ersätts med en förklaring. Genomdrivet i API:t och i databasen, inte
  bara i gränssnittet.
- Demoannonserna finns på **ett** ställe — i dag en modul, senare rader med
  `is_demo = true` — aldrig kopierade i fyra komponenter.
- De räknas aldrig in i statistik som "antal annonser" eller "affärsvolym".
- Det ska gå att **stänga av dem med en inställning** utan kodändring, för när
  riktiga annonser finns blir de brus.

### 9. Backend: Supabase + Vercel — 2026-09-15, William

Frågan fanns inte i listan men var den som styrde fas 3 i `TODO.md`: Express
eller Vercel functions.

**Beslut:** **Supabase** (Postgres, auth, lagring, realtid) med **Vercel** för
webben och de serverfunktioner som måste räkna på servern. `apps/api` (Express +
Prisma) avvecklas.

**Motivering:**

- **Behörighet i databasen.** Regel 5 i `CLAUDE.md` kräver kontroll i tre lager.
  Radnivåpolicy (RLS) i Postgres är det tredje lagret, och Supabase är byggt
  runt det.
- **Due diligence-material** kräver lagring med åtkomstkontroll och
  tidsbegränsade länkar. Supabase Storage har det, policystyrt.
- **Meddelanden i realtid** var det enda skälet att behålla en långlivad
  Express-process. Supabase Realtime täcker det.
- **Samma stack som 123Connect**, där reglerna i `CLAUDE.md` redan prövats.
- Express-API:t var aldrig driftsatt. Att avveckla det kostar inga användare.

**Villkor:**

- Projektet ska ligga i **EU**. Det befintliga Supabase-projektet "123Hansa"
  (`pmtnrqtkuygyyodcovds`) ligger i `us-east-1` och är pausat; regionen går inte
  att byta i efterhand. Ett nytt projekt skapas först när William godkänt
  kostnaden. Det gamla tas inte bort förrän dess innehåll kontrollerats.
- **Egen databas för dev och för produktion.** Preview får aldrig peka på
  produktionsdatabasen.
- Allt som räknar pengar — bud, provision, moms — körs **på servern** med
  `@hansa/core`, aldrig som en direkt skrivning från klienten mot en tabell.
