# Testning

## Vad ett grönt test faktiskt bevisar

`npm run verify` grönt betyder att **affärslogiken stämmer och att koden
kompilerar**. Det betyder inte att sidan fungerar.

Följande fel passerar samtliga tester i repot i dag utan att någon märker något:

- en sida som hämtar sin data från en hårdkodad konstant i stället för från API:t
- en behörighetskontroll som saknas i en route men finns i middleware
- en knapp utan handler
- ett formulär som skickar men aldrig sparar
- en databaskolumn som koden frågar efter men som inte finns

Det är därför `ARCHITECTURE.md` har en statustabell och inte bara en beskrivning.

---

## Vad som testas var

| Var | Vad | Kräver | Läge |
|---|---|---|---|
| `packages/core` | Pengar, valuta, moms, provision, org.nr, språkval | inget | 🟢 83 tester |
| `apps/web` | Rena moduler och komponenter | inget | 🔴 i praktiken inga |
| `apps/api` | Route handlers, validering, behörighet | databas | 🔴 i praktiken inga |
| Röktest | Hela flödet mot levande app | app + databas | 🔴 finns inte |

Kärnan är testad för att den **går** att testa: inga runtime-beroenden, ingen
databas, 400 ms. Det är hela poängen med att lägga reglerna där.

---

## Kommandon

```bash
npm run test:core     # affärslogiken — snabb, kräver ingenting
npm run test          # alla workspaces
npm run type-check
npm run lint
npm run build

npm run verify        # allt ovanstående. Kör den före leverans
```

---

## Regler för tester i det här repot

### Verifiera mot verkligheten, inte mot dig själv

`orgnumber.test.ts` kontrollerar kontrollsiffrorna mot **verkliga, publika
organisationsnummer** för Volvo, Ericsson, Equinor, Telenor, Novo Nordisk,
Mærsk, INA och Podravka.

Ett påhittat nummer som passerar vår egen kontrollsiffra bevisar ingenting — det
bevisar bara att funktionen är konsekvent med sig själv. Det var så ett fel i ett
av de svenska testnumren upptäcktes: fyra riktiga bolag passerade, ett femte inte,
och det femte var felskrivet i testet — inte i algoritmen.

Samma krav gäller varje nytt land: **minst tre verkliga bolag** innan en validator
släpps in.

### Testa egenskapen, inte exemplet

```
utbetalning + provision + moms === försäljningspriset
```

gäller för alla priser, inte bara för det du råkade skriva. `pricing.test.ts`
kör den över flera storleksordningar, och `vat.test`-fallen kontrollerar att
`net + vat === gross` exakt för udda belopp i fyra länder. Ett enda handplockat
exempel hade missat avrundningsfelet.

### Testa det som är lätt att få fel

- `roundHalfUp(-0.5)` ska bli `-1`. `Math.round(-0.5)` blir `-0` — testet
  kontrollerar båda, så att nästa läsare ser **varför** funktionen finns.
- `allocate()` får inte tappa en minsta enhet. 1000 öre på 3 delar är
  `[334, 333, 333]`.
- En kroatisk `Accept-Language` ska landa på `bs`, eftersom `/hr/` inte finns.

### Flaxiga test döljer riktiga egenskaper

Ett test som faller var åttiofemte körning är inte "lite instabilt" — det är ett
felställt krav. Rätta kravet, höj inte tröskeln.

### Var försiktig med Intl i assertions

`Intl.NumberFormat` skiljer sig mellan Node-versioner i mellanslagstecken och
symbolplacering. `money.test.ts` matchar därför på siffrorna med ett tåligt
mönster i stället för tecken för tecken. Ett test som faller vid en
Node-uppgradering utan att något gått sönder lär folk att ignorera röda tester.

---

## Vad som behöver byggas

Se `TODO.md`. I prioritetsordning:

1. **Röktest** som kör hela flödet mot en levande app. Det är det enda som fångar
   "sidan renderar men hämtar mockdata".
2. **Behörighetstester** per route — en anonym begäran mot varje skyddad rutt ska
   ge 401 eller 403, aldrig 200.
3. **Komponenttester** för de ytor där pengar visas.

Punkt 1 och 2 fångar tillsammans de fel som faktiskt förekommer i det här repot.
Punkt 3 är trevligt att ha.
