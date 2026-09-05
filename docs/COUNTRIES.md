# De fem marknaderna

123Hansa är byggt för **Sverige, Norge, Danmark, Kroatien och Bosnien**.

Land är en egenskap hos annonsen och hos användaren — aldrig något en komponent
antar. All data nedan bor i `packages/core/src/country.ts` och kontrolleras av
`country.test.ts`. Ändras något här ska koden och testet följa med i samma
commit.

---

## Översikt

| Land | Kod | Valuta | Minsta enhet | Momssatser | Org.nr | Tidszon | Standardspråk | EU |
|---|---|---|---|---|---|---|---|---|
| Sverige | `SE` | SEK | öre | 25 / 12 / 6 % | Organisationsnummer, 10 siffror | Europe/Stockholm | `sv` | ✅ |
| Norge | `NO` | NOK | øre | 25 / 15 / 12 % | Organisasjonsnummer, 9 siffror | Europe/Oslo | `no` | ❌ |
| Danmark | `DK` | DKK | øre | **25 %** | CVR-nummer, 8 siffror | Europe/Copenhagen | `da` | ✅ |
| Kroatien | `HR` | EUR | cent | 25 / 13 / 5 % | OIB, 11 siffror | Europe/Zagreb | `bs` | ✅ |
| Bosnien | `BA` | BAM | fening | **17 %** | JIB, 13 siffror | Europe/Sarajevo | `bs` | ❌ |

**Danmark och Bosnien har en enda momssats.** Det är avsiktligt och inte en lucka
i tabellen. Ett `vatRates` med en post ska inte "fyllas på" av någon som tycker
att den ser tom ut.

Momssatserna anges i **baspunkter** i koden: 2500 = 25 %.

---

## Valuta

Alla fem valutorna har i dag två decimaler. Skriv ändå aldrig `/ 100` —
`CURRENCY_INFO[...].decimalDigits` avgör. Mekanismen finns för att regeln ska
hålla när den inte längre gör det; systerprodukten Burp har redan träffat på
serbiska dinarer, som har noll decimaler.

Kroatien bytte från kuna till **euro den 1 januari 2023**. Det finns inga
kuna-belopp i systemet och ska inte finnas några.

Bosniska marken (BAM) är **fast knuten till euron** — 1 EUR = 1,95583 BAM sedan
valutastyrelsen infördes. Kursen rör sig alltså inte, men beloppen får ändå
aldrig summeras med euro: en fast kurs är ett politiskt beslut, inte en garanti,
och en rapport som blandar valutor går inte att revidera.

Norska och danska kronan flyter. Danmark har fastkurspolitik mot euron inom ett
smalt band; Norge har inte det.

---

## Organisationsnummer

Fyra av fem länder har en kontrollsiffra, och den kontrolleras i
`packages/core/src/orgnumber.ts`. Algoritmerna är verifierade mot verkliga,
publika organisationsnummer för kända bolag — se `orgnumber.test.ts`. Ett
påhittat nummer som passerar vår egen kontrollsiffra bevisar ingenting.

| Land | Format | Kontroll | Noteringar |
|---|---|---|---|
| SE | 10 siffror | Luhn (mod 10) | Tolvsiffrig form med sekelprefix `16` accepteras. Tredje siffran ≥ 2 — annars är det ett personnummer |
| NO | 9 siffror | Mod 11, vikter 3,2,7,6,5,4,3,2 | Börjar alltid på 8 eller 9 |
| DK | 8 siffror | Mod 11, vikter 2,7,6,5,4,3,2 | Börjar aldrig med 0 |
| HR | 11 siffror | ISO 7064 MOD 11,10 | OIB gäller både bolag och privatpersoner |
| BA | 13 siffror | ⚠️ **endast format** | Se nedan |

### Varför bosniskt JIB bara formatkontrolleras

Någon offentligt publicerad kontrollsiffra för JIB har inte kunnat bekräftas. Att
gissa en algoritm vore värre än att avstå: ett felaktigt avvisat nummer stänger
ute en riktig säljare, och det syns aldrig i loggarna eftersom hen bara ger upp
och går någon annanstans.

Bosniska annonser behöver därför ett **registeruppslag** för att räknas som
verifierade. Se `OPEN-QUESTIONS.md`, fråga 3.

### Svenska särfallet: enskild firma

Ett tiosiffrigt nummer med tredje siffran under 2 är ett **personnummer**, inte
ett organisationsnummer. En enskild firma som säljs får aldrig publiceras med
ägarens personnummer i en publik annons — det är en personuppgift och en
identitetsstöldsrisk. Validatorn avvisar dem med just den motiveringen.

---

## Företagsregister

Formatvalidering säger att numret är välformat. Den säger ingenting om att
företaget finns, är aktivt eller ägs av den som säljer det. Uppslag mot register
är en **öppen fråga** — se `OPEN-QUESTIONS.md`, fråga 3.

| Land | Register | Myndighet |
|---|---|---|
| SE | Näringslivsregistret | Bolagsverket |
| NO | Enhetsregisteret / Foretaksregisteret | Brønnøysundregistrene |
| DK | Det Centrale Virksomhedsregister (CVR) | Erhvervsstyrelsen |
| HR | Sudski registar | Handelsdomstolarna |
| BA | Register poslovnih subjekata | APIF (RS) / entitetsvis registrering |

⚠️ **Bosnien är administrativt delat.** Federationen BiH, Republika Srpska och
Brčko distrikt har egna register och delvis egna regler. Att behandla "Bosnien"
som en enhet i registerfrågan kommer att gå fel. Detsamma gäller inte moms —
17 % är statlig och gäller hela landet.

---

## Språk

Fem språk, fem länder — men inte ett per land. Se `CLAUDE.md`, avsnittet Språk,
för hela resonemanget.

| Kod | Täcker | Standard i | hreflang |
|---|---|---|---|
| `sv` | Svenska | SE | `sv` |
| `no` | Norsk bokmål | NO | `no`, `nb`, `nn` |
| `da` | Danska | DK | `da` |
| `bs` | Bosniska + kroatiska, latinsk skrift | BA, HR | `bs`, `hr`, `sr-Latn` |
| `en` | Övriga och internationella köpare | — | `en` |

`hr`, `sr`, `nb` och `nn` är alias i `Accept-Language` — **aldrig adresser**.

---

## Telefon

| Land | Prefix |
|---|---|
| SE | +46 |
| NO | +47 |
| DK | +45 |
| HR | +385 |
| BA | +387 |

Lagra alltid i E.164 (`+46701234567`). Formatera först vid presentation.

---

## Vad som INTE är avgjort per land

Följande skiljer sig mellan marknaderna och är **inte** löst i koden. Gissa dem
inte — se `OPEN-QUESTIONS.md`.

- **Moms på förmedlingsprovisionen** vid gränsöverskridande affär. Norge och
  Bosnien står utanför EU; omvänd skattskyldighet gäller mellan EU-länder vid
  B2B men inte överallt. `COUNTRY_INFO.inEu` finns för att frågan ska gå att
  ställa i kod, men svaret är inte inlagt.
- **Om själva bolagsöverlåtelsen är momspliktig.** I flera av länderna är en
  verksamhetsöverlåtelse undantagen. Provisionen är en tjänst och det är den vi
  fakturerar — men avgränsningen måste bekräftas av revisor per land.
- **Escrow och klientmedel.** Reglerna för att hålla annans pengar skiljer sig
  kraftigt mellan de fem, och Bosnien är strängast.
- **Betalleverantör.** Ingen är vald. Stripe finns i `package.json` sedan
  tidigare men täcker inte alla fem marknaderna lika.

---

## Att lägga till ett sjätte land

1. Lägg till koden i `CountryCode` och posten i `COUNTRY_INFO`.
2. Lägg till valutan i `CurrencyCode` och `CURRENCY_INFO` — kontrollera
   `decimalDigits` mot verkligheten, inte mot antagandet att den är 2.
3. Skriv en validator för organisationsnumret och **verifiera den mot minst tre
   verkliga bolag** innan den släpps in.
4. Bestäm standardspråk. Ska ett befintligt språk täcka landet, eller behövs en
   ny ordbok? Nästan identiska ordböcker glider isär — välj hellre att återanvända.
5. Uppdatera tabellerna i det här dokumentet.
6. Kör `npm run test:core`. Testerna i `country.test.ts` går igenom alla länder i
   `COUNTRY_CODES` och faller om något saknas.

Punkt 6 är poängen med att data ligger i en tabell och inte i komponenterna: ett
nytt land är en post, inte en jakt genom kodbasen.
