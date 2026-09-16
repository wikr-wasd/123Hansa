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

🟡 **Delvis besvarad 2026-09-15:** ingen success fee. Intäkterna är listning,
betald exponering och abonnemang — se `BUSINESS.md`. Kvar att besvara är
**prisnivåerna** per avgift och land, och vad ett abonnemang innehåller.
Delfrågorna nedan om procent, slutpris och tak gällde provisionen och har fallit
bort.

**Den ursprungliga frågan:** Vad tar 123Hansa betalt, och på vad?

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

✅ **Besvarad 2026-09-15:** köpeskillingen går aldrig genom plattformen. Parterna
sköter avtal och betalning själva. Kvar är en mindre fråga: vilken
betalleverantör som tar emot **avgifterna** (listning, exponering, abonnemang) i
de fem valutorna.

**Den ursprungliga frågan:** Hur flyttas pengarna, och vem håller dem under affären?

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

✅ **Besvarad 2026-09-15, och omprövad samma dag** — se "Besvarade frågor" längst
ned. ⚠️ De två svaren motsäger varandra och William behöver bekräfta det senare.

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

## 10. Vilka annonser ryms inom "ingen licens"? ⛔ blockerar annonsformuläret

Strategin bygger på att marknadsplatsen inte behöver tillstånd. Det håller för
**hela bolag som säljs till en köpare**. Tre av annonstyperna i dag ligger nära
en gräns och behöver en jurists bedömning innan de finns i formuläret:

- **Andelar till flera köpare.** En annons som erbjuder minoritetsposter i ett
  bolag till många investerare är inte längre en M&A-affär — det är ett
  erbjudande av värdepapper, och i praktiken crowdfunding bakvägen. Förslag:
  annonsen gäller hela bolaget eller en kontrollerande post till **en** köpare.
- **Fakturor.** Köp och försäljning av fakturor är finansiering. En plattform där
  investerare köper fakturor kan hamna under finansierings- eller
  crowdfundingregler. Förslag: bort ur fas ett.
- **Kommersiella fastigheter.** Den som yrkesmässigt förmedlar fastigheter mot
  ersättning omfattas i Sverige av fastighetsmäklarlagen. En ren annonsplats gör
  inte det, men matchning i kombination med avgifter kopplade till fastigheten
  ska bedömas.

**Status:** ⬜ obesvarad

---

## 12. Vilka länder är "Norden" vid lansering?

Strategin omprövades 2026-09-15 till Norden först. `country.ts` har SE, NO och
DK. **Finland och Island** står inte där.

- Finland har euro, finska och svenska, Y-tunnus med kontrollsiffra och ett eget
  bolagsregister. Tekniskt en post i `COUNTRY_INFO`, men en ny ordbok (`fi`).
- Utan Finland är "nordisk" en överdrift i marknadsföringen.

**Status:** ⬜ obesvarad. Tills vidare gäller SE, NO och DK.

---

## 13. Vinkeln mot konkurrenterna

Bolagsplatsen, Selskapstorget och Saxis tar redan betalt per annons eller
abonnemang — se `BUSINESS.md`, avsnittet Konkurrenter. Samma modell räcker inte
som skäl för en säljare att välja 123Hansa.

Vilken vinkel bär lanseringen? Förslagen i `BUSINESS.md`: en plattform för hela
Norden, inbyggt datarum, mäklare som kunder, och senare Balkankorridoren.

**Varför det blockerar:** vinkeln avgör vad som byggs först. Mäklare som kunder
kräver organisationskonton med flera användare och uppdrag per mäklare från dag
ett — det är en annan datamodell än en säljare med en annons.

**Status:** ⬜ obesvarad

---

## 14. Datakälla för företagsuppgifter

Värderingsverktyget och verifieringen av säljare behöver riktiga bolagsuppgifter:
namn, organisationsnummer, bransch, och för värderingen omsättning och resultat.

**Att skrapa allabolag.se är inte ett alternativ.** De säljer själva den datan
via eget API, deras villkor tillåter inte automatisk insamling, och
sammanställningen skyddas dessutom av katalogskyddet (49 § upphovsrättslagen,
EU:s databasdirektiv). En marknadsplats vars hela strategi bygger på att följa
reglerna kan inte börja med att bryta mot någon annans.

Officiella källor per lanseringsland:

| Land | Källa | Läge |
|---|---|---|
| NO | Brønnøysundregistrene, Enhetsregisteret + nyckeltal ur Regnskapsregisteret | Öppna data, gratis |
| DK | CVR/Virk, officiellt API | Gratis, kräver registrering |
| SE | Bolagsverkets API:er, SCB:s avgiftsfria företagsregister, eller licensierad leverantör (Roaring, Creditsafe, allabolag/D&B) | Kräver avtal. Årsredovisningsdata kostar oftast |

**Frågan:** vilken svensk källa, och vad får den kosta per uppslag?

**Konsekvens i koden:** hämtningen byggs bakom ett gränssnitt med en adapter per
land, och anropen sker på servern — aldrig från webbläsaren, eftersom nycklar
och anropsgränser inte hör hemma där.

⚠️ **Dataskydd:** uppgifter om enskilda firmor är personuppgifter. Innan
uppslagen börjar sparas behövs en post i `PERSONUPPGIFTER.md`.

**Status:** ⬜ obesvarad

---

## 15. Vad ska värderingstjänsten vara?

Det finns i dag två saker med samma namn:

1. **Schablonen** på startsidan — `estimateValuation()` i `@hansa/core`, öppen
   för alla, säger rakt ut att den är en schablon. Byggd 2026-09-16.
2. **"Professionell värdering 2 500 kr"** på `/valuation` — en betaltjänst som
   lovar en rapport från "våra experter". **Den tjänsten finns inte.**

Alternativen för nummer två: bygga den med en riktig värderingspartner som
utför arbetet, eller ta bort den. Att sälja den i befintligt skick går inte.

**Status:** ⬜ obesvarad

---

## 11. Sekretessavtalet inför datarummet

Regel 6 i `CLAUDE.md` kräver signerat sekretessavtal innan någon ser due
diligence-material. Strategin säger samtidigt att avtal mellan parterna sköts av
parterna.

- Ska plattformen erbjuda ett **standardavtal** som köparen accepterar i
  gränssnittet?
- Eller laddar **säljaren upp sitt eget** avtal, som köparen accepterar?
- Plattformen är inte part i avtalet i något av fallen. Att köparen accepterat —
  vem, vilken version, när — loggas oföränderligt.

**Rekommendation:** säljarens eget avtal, med ett standardutkast som säljaren
kan välja att använda. Då är det parternas avtal och inte plattformens.

**Status:** ⬜ obesvarad

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

#### ⚠️ Omprövad 2026-09-15, William: fas två, med ECSP-tillstånd

Senare samma dag: *"Crowdfunding som fas två och bara med ECSPR-tillstånd i ett
EU-land."* Se `BUSINESS.md`.

**Det här motsäger beslutet ovan.** ECSP-förordningen gäller investerings- och
lånebaserad crowdfunding. **Reward-based omfattas inte**, och kräver inget
ECSP-tillstånd. Att vänta in ett tillstånd betyder alltså att det är
investeringsbaserad crowdfunding som avses.

Tills William bekräftat gäller det som båda svaren är överens om: **ingen
crowdfunding byggs i fas ett**, den döljs från marknadsplatsen, och den blir en
separat tjänst med egen juridisk person, domän, app och databas.

### Strategin — 2026-09-15, William

Beslutad samma dag och beskriven i sin helhet i `BUSINESS.md`:

- **Ren M&A-marknadsplats:** annonser, matchning, betald exponering, datarum.
  Ingen licens. Avtal och betalning mellan parterna sköts av parterna
- **Intäkt på abonnemang och listning**, aldrig success fee — besvarar delar av
  fråga 1 och hela fråga 2
- **AML- och sanktionsscreening från start**, även utan skyldighet
- **Crowdfunding i fas två**, separat, med ECSP-tillstånd — omprövar fråga 6
- **Bosnien och Serbien som köparsida först**, investeringar in i EU

**Motivering:** kort väg till lansering utan tillståndsprövning, en intäktsmodell
som inte gör plattformen till förmedlare, och en användarmodell som tål att
plattformen senare tar fler steg mot affären.

**Det strategin öppnar:** frågorna 10 och 11 ovan, och Serbien som sjätte land.

#### Omprövad 2026-09-15, William: Norden först

Lansering i **Sverige, Norge och Danmark**. Kroatien, Bosnien och Serbien i ett
senare skede. Crowdfunding som ett **eget projekt** med eget bolag, eget repo och
egen databas. Se `BUSINESS.md`. Öppnar frågorna 12 och 13.

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
- Allt som räknar pengar — avgifter och moms — körs **på servern** med
  `@hansa/core`, aldrig som en direkt skrivning från klienten mot en tabell.
