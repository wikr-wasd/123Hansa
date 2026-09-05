# Arkitektur

## Vad som faktiskt är byggt

Läs det här först. Repots tidigare dokumentation beskrev projektet som
"produktionsredo för 1000+ användare"; det stämde inte, och den som bygger vidare
på den beskrivningen bygger fel.

Status vid genomgången **2026-09-05**:

| Del | Läge | Kommentar |
|---|---|---|
| `@hansa/core` | 🟢 Klar och testad | 83 tester. Pengar, land, moms, provision, org.nr, språk |
| Webbens rutter | 🟡 Finns | 35 rutter i `App.tsx`, men flera renderar mockdata |
| Annonsdata | 🔴 Mockad | `mockListings` hårdkodad i minst fyra filer. API:t anropas inte |
| API:ts rutter | 🟡 Finns | 13 route-filer. Täckningen mot webben är inte verifierad |
| Databasschema | 🔴 Otillräckligt | 11 Prisma-modeller. Bud, NDA, due diligence och utbetalning saknas |
| i18n | 🟡 Delvis | `sv`, `en`, `no`, `da` i en fil. `bs` saknas. 5 komponenter använder den |
| Autentisering | 🟡 Finns | JWT + Supabase-spår. Åtkomstmatrisen är inte genomdriven i tre lager |
| Betalning | 🔴 Inte beslutat | Stripe i package.json, ingen leverantör vald |
| Tester | 🔴 Nästan inga | Utanför `@hansa/core` finns i praktiken ingen täckning |

🟢 klar · 🟡 påbörjat · 🔴 inte gjort

---

## Systemet

```
                 ┌───────────────────────────────┐
   Webbläsare ──▶│ apps/web  @123hansa/web       │
                 │ React 18 + Vite + Tailwind    │
                 │ react-router · zustand        │
                 └───────────┬───────────────────┘
                             │ HTTP/JSON
                 ┌───────────▼───────────────────┐
                 │ apps/api  @123hansa/api       │
                 │ Express + Prisma              │
                 │ JWT · Zod · rate limiting     │
                 └───────────┬───────────────────┘
                             │
                 ┌───────────▼───────────────────┐
                 │ PostgreSQL                    │
                 └───────────────────────────────┘

        ┌──────────────────────────────────────────┐
        │ packages/core  @hansa/core               │
        │ Pengar · land · moms · provision · org.nr│
        │ INGEN runtime-koppling                   │
        └──────────────────────────────────────────┘
              ▲                            ▲
              └── används av web ──────────┘ och av api
```

`apps/web/api/` innehåller dessutom Vercel serverless functions. Att det finns
**två** API-ytor — Express-appen och Vercel-funktionerna — är en skuld, inte ett
designbeslut. Se TODO.

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

## Dataflödet för en affär

Så här ska det se ut. I dag är steg 1–2 mockade och steg 4–7 inte byggda.

1. **Säljaren skapar en annons.** Land väljs, och landet avgör valuta, momssatser
   och vilket organisationsnummerformat som krävs. Numret valideras mot rätt
   lands algoritm.
2. **Annonsen granskas** innan den publiceras. En marknadsplats för bolagsaffärer
   utan granskning blir en bedrägeriplattform.
3. **Köparen hittar annonsen.** Publik information: bransch, ort, omsättning i
   spann, utropspris.
4. **Köparen visar intresse.** Kontaktuppgifter delas inte automatiskt.
5. **Sekretessavtal signeras.** Först därefter öppnas due diligence-materialet,
   och åtkomsten loggas oföränderligt.
6. **Bud läggs.** Servern hämtar annonsens pris — klienten skickar aldrig ett
   pris. En summa från klienten används bara som kontroll och avviker den avbryts
   budet.
7. **Affären avslutas.** Provisionen räknas med `calculateCommission()` i
   säljarens valuta med säljarens momssats. Valutan fryses på affären.

Steg 5 och 6 är de som gör 123Hansa till mer än en annonssajt, och det är de som
inte finns.

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
delvis samma sak. En av dem ska bort. Vilken beror på om API:t behöver köra
långlivade processer — WebSocket för meddelanden talar för Express, allt annat
för serverless.

**Mockdata i komponenter.** `mockListings` finns i fyra filer. Data ska komma
från API:t genom ett servicelager, inte ur en konstant i en vy.

**Prisma-schemat är för litet.** 11 modeller täcker användare, annonser och
administration. Bud, sekretessavtal, dokument med åtkomstlogg, affärer och
utbetalningar saknas helt.

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
