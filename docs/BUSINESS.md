# Affärsmodellen

Strategin beslutades av William 2026-09-15. Den ersätter den tidigare
beskrivningen, där plattformen skulle bära affären hela vägen till bud och avslut.

## Vad 123Hansa är — och inte är

**En M&A-marknadsplats.** Säljare lägger upp bolag och affärstillgångar, köpare
hittar dem, och plattformen ger båda verktygen att ta första kontakten på ett
seriöst sätt.

| 123Hansa gör | 123Hansa gör inte |
|---|---|
| Annonser för hela bolag och affärstillgångar | Förhandlar eller företräder någon part |
| Matchning mellan köparprofiler och annonser | Tar betalt per genomförd affär |
| Betald exponering av annonser | Hanterar köpeskilling, handpenning eller escrow |
| Datarum med sekretess och åtkomstlogg | Upprättar köpeavtal eller överlåtelsehandlingar |
| AML- och sanktionsscreening av användare och bolag | Erbjuder andelar till många investerare |

Avtal och kontrakt mellan köpare och säljare sköter parterna själva, med egna
rådgivare. **Det är gränsen som gör att marknadsplatsen kan starta utan
tillstånd.** Varje funktion som flyttar plattformen över den gränsen — ett
budflöde, en avgift per avslut, en tjänst som håller pengar — kräver ett nytt
beslut, inte bara en ny komponent.

## Intäkter: abonnemang och listning, aldrig success fee

| Intäkt | Vem betalar |
|---|---|
| **Listningsavgift** | Säljaren, per annons |
| **Betald exponering** | Säljaren — framlyft placering, nyhetsbrev, matchningsutskick |
| **Abonnemang** | Köpare (matchning, bevakningar, datarumsåtkomst) och rådgivare |

**Varför inte success fee:** en avgift som bara faller ut när affären genomförs
gör plattformen ekonomiskt beroende av att affären blir av. Det drar den mot
förmedlarrollen — med de krav som följer, och med en intressekonflikt mot köparen.

**Betald exponering får aldrig se ut som redaktionellt urval.** En framlyft annons
märks som annonserad. Matchningen rangordnar efter relevans, inte efter vem som
betalat.

Prisnivåerna är inte beslutade — `OPEN-QUESTIONS.md` fråga 1. Avgifterna tas ut i
köparens eller säljarens landsvaluta, som heltal i minsta enhet, med moms enligt
landet. Fråga 4 om moms vid gränsöverskridande köp gäller fortfarande.

## Marknaderna: Norden först, Balkan i ett senare skede

Omprövat av William 2026-09-15: **lansering i Sverige, Norge och Danmark.**
Kroatien, Bosnien och Serbien kommer i ett senare skede.

| Skede | Länder | Roll |
|---|---|---|
| **Lansering** | SE, NO, DK | Säljare och köpare |
| **Senare** | HR | Säljare och köpare, EU-land |
| **Senare** | BA, RS | Köpare som investerar in i nordiska och EU-bolag |

**Varför det är rätt ordning:** tre länder med e-legitimation, fungerande
bolagsregister, närliggande språk och samma affärskultur. Det halverar det som
måste byggas före lansering — ingen `bs`-ordbok, ingen screening utan
e-legitimation, ingen granskning av investeringar från tredje land — och det gör
det möjligt att ta första kunderna innan resten är klart.

`@hansa/core` behåller alla fem länderna. Kärnan är redan byggd och testad, och
att ta bort dem vore att riva det som sedan ska byggas igen. Det är **gränssnittet
och registreringen** som bara erbjuder SE, NO och DK vid lansering.

**Öppet:** räknas Finland och Island till "Norden" här? De står inte i
`country.ts`. Se `OPEN-QUESTIONS.md` fråga 12.

### Balkanflödet, när det blir aktuellt

Köpare från Bosnien och Serbien som investerar in i EU är juridiskt enklare än
att ta in EU-kapital i bolag på Balkan, med deras register, valutaregler och
svagare rättsliga infrastruktur.

**Det flödet är enklare, inte fritt:**

- **Granskning av utländska direktinvesteringar.** En köpare utanför EU som köper
  ett bolag i en skyddsvärd sektor kan omfattas av nationell granskning — i
  Sverige lagen om granskning av utländska direktinvesteringar, och motsvarande i
  Danmark och Norge, inom ramen för EU-förordningen 2019/452. Plattformen ska inte
  bedöma det, men en annons i en berörd sektor ska visa att granskning kan krävas.
- **Bankernas kundkännedom.** Pengar från Bosnien och Serbien in i ett EU-bolag
  granskas av säljarens och köparens banker. Plattformens egen screening gör
  köparen trovärdigare där, men ersätter den inte.
- **Serbien är ett sjätte land.** Det står inte i `country.ts`, och villkoren i
  avsnittet nedan gäller — även om köparsidan kräver mindre än säljarsidan.

## AML- och sanktionsscreening från start

Beslutat trots att marknadsplatsen troligen inte är skyldig att göra det. Skälet:
den dag plattformen tar ett steg närmare affären ska det inte kräva en ombyggnad
av användarmodellen.

- **Sanktionslistor** — EU:s konsoliderade lista och FN:s. Förbudet att göra
  ekonomiska resurser tillgängliga för listade personer gäller alla i EU, så den
  här delen är i praktiken inte frivillig.
- **Bolag och verkliga huvudmän**, inte bara den person som skapar kontot.
- **PEP-screening** — personer i politiskt utsatt ställning.
- **Omprövning** när listorna uppdateras, inte bara vid registrering.

⚠️ **Dataskydd är den svåra delen.** Utan rättslig förpliktelse vilar screeningen
på berättigat intresse, och PEP- och sanktionsträffar ligger nära uppgifter om
lagöverträdelser (artikel 10 i GDPR). Det kräver en konsekvensbedömning (DPIA)
och en post i `PERSONUPPGIFTER.md` **innan** första screeningen körs.

Leverantör är inte vald.

## Crowdfunding: ett eget projekt, med eget bolag

Crowdfunding är **inte** en del av marknadsplatsen och byggs inte i fas ett.

### Vad som skyddar dig — och vad som inte gör det

Frågan som ställdes 2026-09-15 var hur crowdfunding kan separeras så att staten
inte kan ta 123Hansa för regelbrott. Svaret har två delar, och bara den ena är
teknisk:

| Skyddar | Skyddar inte |
|---|---|
| **Ett eget aktiebolag** som driver crowdfunding och söker tillståndet | Ett separat repo, en separat domän eller ett separat varumärke — om samma bolag driver båda |
| **Tillståndet** innan första kampanjen tar emot pengar | Att koden ligger isär medan verksamheten i praktiken är densamma |
| **Att marknadsplatsen aldrig erbjuder andelar** till flera investerare | Friskrivningar i villkoren som säger emot vad tjänsten faktiskt gör |
| **Egen databas och egna villkor**, så att kunddata inte blandas | Att dela användarkonton mellan tjänsterna utan rättslig grund |

Myndigheterna bedömer **vad verksamheten gör och vem som gör det**, inte hur
koden är organiserad. Separationen i kod är nödvändig för att separationen i
bolag ska gå att upprätthålla — men det är bolaget och tillståndet som skyddar.

Det här är inte juridisk rådgivning. Innan crowdfunding-bolaget bildas behövs
en jurist med erfarenhet av ECSP.

### Så separeras det

- **Eget repo** (`123Hansa-Crowdfunding` eller det namn varumärket får), inte en
  mapp i det här repot. Ett gemensamt repo gör det för lätt att dela kod,
  databas och inloggning av bekvämlighet.
- **Eget Vercel-projekt, egen Supabase-databas, egen domän.**
- **Delar bara `@hansa/core`**, som publiceras som paket. Pengar, moms och
  organisationsnummer räknas likadant i båda — utan att tjänsterna delar data.
- **Inga delade användarkonton.** En länk från marknadsplatsen till
  crowdfunding-tjänsten är en länk, inte en inloggning.

### Regelverket

- Investeringsbaserad crowdfunding kräver tillstånd enligt **ECSP-förordningen**
  (EU 2020/1503) i ett EU-land. Tillståndet gäller sedan i hela EU.
- Handläggningen är upp till tre månader från komplett ansökan. Förberedelsen —
  organisation, kapital, riktlinjer, system — räknas i sex till tolv månader.
- ECSP-förordningen gäller **investerings- och lånebaserad** crowdfunding.
  Reward-based omfattas inte. Vilken typ som avses är inte bekräftat —
  `OPEN-QUESTIONS.md` fråga 6.

Crowdfunding-koden raderades ur webben 2026-09-15 och finns i git-historiken.

## Konkurrenter

Genomgång 2026-09-15 av de publika webbplatserna. Siffrorna är vad
konkurrenterna själva uppger och har inte kontrollerats.

### Sverige

| Aktör | Vad de uppger | Modell |
|---|---|---|
| **Bolagsplatsen** | 1 000+ bolag till salu, ~50 000 registrerade köpare, 10 000+ affärer sedan 2006, de flesta svenska företagsmäklare anslutna | Fast pris per annons efter bolagets storlek. Köpare gratis. Bevakningar, sekretessavtal, juridiska mallar |
| **Objektvision** | ~450 bolag till salu, stark på kommersiella fastigheter | Fokus på lokaler och fastigheter där verksamheten ingår |

### Norge

| Aktör | Vad de uppger | Modell |
|---|---|---|
| **Selskapstorget** | 1 000+ bolag, 45 000+ köpare, sedan 2006 | Fast pris efter storlek. Samma texter och siffror som Bolagsplatsen — ser ut att vara samma verksamhet på norska |
| **Bedriftsmarked, BedrifterTilSalgs, Nobema** | Mindre marknadsplatser | Annonsplatser, Nobema med anonym annonsering |

### Danmark

| Aktör | Vad de uppger | Modell |
|---|---|---|
| **Saxis** | "Danmarks största", 3 200+ sålda bolag, ~110 aktiva annonser | Månadsabonnemang för säljare, "Boost" för exponering, värdering från 2 997 kr |
| **Firmatorv** | 500+ bolag | Gratis |
| **Upy** | Bolag och webshops | Marknadsplats |
| **Virksomhedsbørsen** | Sedan 1997 | Förmedling |

### Internationellt

**SMERGERS** och **DealStream** listar bolag i hela Europa, men utan lokal
närvaro i Norden.

### Vad det betyder

**Affärsmodellen är inte unik.** Bolagsplatsen, Selskapstorget och Saxis tar
redan betalt per annons eller per månad, precis som 123Hansa ska göra. Det
bekräftar att modellen fungerar — och att den inte räcker som skäl att välja oss.

**Bolagsplatsens vallgrav är mäklarna.** De flesta svenska företagsmäklare lägger
ut sina uppdrag där. Säljare följer köpare, köpare följer annonser. En ny
marknadsplats som försöker vara "Bolagsplatsen, men nordisk" börjar med noll av
båda mot en aktör med 20 års försprång.

**Möjliga vinklar, som beslutsunderlag:**

1. **En plattform för hela Norden.** Konkurrenterna är nationella sajter. En
   dansk köpare av ett svenskt bolag, eller en svensk mäklare med norska köpare,
   har ingen gemensam plats. Valuta, moms och organisationsnummer per land finns
   redan i `@hansa/core`.
2. **Datarummet inbyggt.** Konkurrenterna slutar vid kontakten och sekretessavtalet.
   Ett datarum med åtkomstlogg brukar vara en separat tjänst som mäklaren betalar
   för.
3. **Mäklarna som kunder, inte konkurrenter.** Ett abonnemang för mäklare som
   ger dem datarum, köparmatchning över landsgränser och screening är ett skäl för
   dem att lägga uppdrag här också.
4. **Balkankorridoren, senare.** Ingen av de nordiska aktörerna har den.

Vinkel 3 är den som löser utbudsproblemet. Vinkel 1 och 2 är det som gör den
säljbar.

## Referenscase

**Det finns inga.** 123Hansa har ännu inte haft en enda riktig annons, användare
eller affär. De "framgångsrika affärer", kundomdömen och siffror som stod på
webbplatsen var påhittade och är borttagna.

Så skaffas de första:

- **Pilotsäljare** — tre till fem nordiska bolag som annonserar gratis mot att
  deras erfarenhet får beskrivas, med skriftligt samtycke
- **En eller två mäklare** som testar datarummet på riktiga uppdrag
- Ett referenscase publiceras först när affären eller kontakten faktiskt skett,
  med namn bara om bolaget godkänt det

## Vad som krävs för ett nytt land

1. En avgiftsnivå som bär i den marknadens prisnivå
2. För säljarsidan: ett register att verifiera bolag mot
3. Ett sätt att verifiera en person utan e-legitimation, om sådan saknas
4. Screening som täcker landets bolag och verkliga huvudmän
5. Momsfrågan löst med revisor
6. Språkbeslut: täcker en befintlig ordbok landet, eller behövs en ny?

Den tekniska delen är en post i `COUNTRY_INFO` och ett par timmar. Den är inte
det svåra — punkt 1 till 5 är det.

**Ingen funktion får förutsätta BankID.** Köparsidan ligger i länder där det inte
finns.
