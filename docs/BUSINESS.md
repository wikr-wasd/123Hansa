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

## Marknaderna: säljarsida och köparsida

| Roll | Länder | Logik |
|---|---|---|
| **Säljarsida** | SE, NO, DK, HR | Bolag i EU/EES som säljs |
| **Köparsida först** | BA, RS | Köpare från Bosnien och Serbien som investerar in i EU |

**Varför det flödet först:** kapital från Balkan in i EU-bolag är juridiskt
enklare att hantera än att ta in EU-kapital i bolag i Bosnien och Serbien, med
deras register, valutaregler och svagare rättsliga infrastruktur.

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

## Crowdfunding: fas två, med ECSP-tillstånd

Crowdfunding är **inte** en del av marknadsplatsen och byggs inte i fas ett.

- Investeringsbaserad crowdfunding kräver tillstånd enligt **ECSP-förordningen**
  (EU 2020/1503) i ett EU-land. Tillståndet gäller sedan i hela EU.
- Handläggningen är upp till tre månader från komplett ansökan. Förberedelsen —
  organisation, kapital, riktlinjer, system — räknas i sex till tolv månader.
- Crowdfunding ska vara **en separat tjänst**: eget varumärke, egen domän, egen
  app i repot, egen databas och egna villkor — och sannolikt en egen juridisk
  person som innehar tillståndet. Det är den juridiska personen och vad den gör
  som avgör tillståndskraven, inte hur koden är uppdelad.

Crowdfunding-koden som finns i webben i dag döljs från marknadsplatsen och flyttas
ut när fas två börjar.

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
