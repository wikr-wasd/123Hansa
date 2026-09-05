# Öppna frågor

Beslut som blockerar bygget. **Gissa dem inte i kod.**

Ett antagande som skrivs in i en komponent blir osynligt inom en vecka och
kostar en omskrivning inom en månad. Det som står här är medvetet obesvarat i
kodbasen: provisionssatsen är ett argument, inte en konstant, och
momshanteringen vid gränsöverskridande affär är inte implementerad alls.

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

README och koden nämner crowdfunding parallellt med företagsförsäljning. De två
är helt olika produkter juridiskt:

- **Reward-based** (förköp av en produkt) — lätt reglerat.
- **Equity crowdfunding** (andelar i bolaget) — kräver tillstånd som
  gräsrotsfinansieringsplattform, i EU under ECSP-förordningen, och
  Finansinspektionens tillstånd i Sverige. Norge och Bosnien har egna regimer.
- **Lånebaserad** — ännu en regim.

`apps/web/src/components/crowdfunding/` och `data/crowdfundingData.ts` finns
redan i koden. **Vilken av de tre som byggs är inte dokumenterat någonstans.**

Är det equity kan det inte lanseras utan tillstånd, oavsett hur klar koden är.

**Status:** ⬜ obesvarad — och den här kan blockera lansering helt

---

## 7. Vad händer med den befintliga mockdatan?

Trettio annonser ligger hårdkodade i komponenterna. De ser ut som riktiga
företag till salu.

- Ska de bort helt innan lansering, eller finnas kvar som demo bakom en flagga?
- Om de finns kvar i produktion: en besökare som hör av sig om ett bolag som inte
  finns är ett förtroendeproblem, inte en bugg.

**Rekommendation:** bort. En tom marknadsplats är ärlig; en full av påhittade
bolag är det inte.

**Status:** ⬜ obesvarad

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

Inga än. När en fråga besvaras flyttas den hit med datum och motivering — inte
bara med svaret. Motiveringen är det som gör att beslutet går att ompröva när
förutsättningarna ändras.
