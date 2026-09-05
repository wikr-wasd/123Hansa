# 123Hansa

Marknadsplats för företagsaffärer i **Sverige, Norge, Danmark, Kroatien och
Bosnien**. Köp och sälj hela bolag, kommersiella fastigheter, fakturor och andra
affärstillgångar — plus crowdfunding för bolag som söker kapital i stället för en
köpare.

Det som skiljer 123Hansa från en annonssajt är att affären går att **genomföra**
på plattformen: verifierad säljare, sekretessavtal, due diligence-material bakom
åtkomstkontroll, bud och avslut.

---

## Status

**Under uppbyggnad.** Kärnan för de fem marknaderna är byggd och testad; appen
ovanpå är det inte.

| Del | Läge |
|---|---|
| Affärslogik (`@hansa/core`) | 🟢 83 tester gröna |
| Webbgränssnitt | 🟡 35 rutter, flera renderar mockdata |
| API | 🟡 13 route-filer, täckningen inte verifierad |
| Databasschema | 🔴 11 modeller — bud, NDA och avslut saknas |
| Flerspråkighet | 🟡 `sv`, `en`, `no`, `da` finns. `bs` saknas |
| Betalning | 🔴 Ingen leverantör vald |

`docs/ARCHITECTURE.md` har hela tabellen. **Tidigare versioner av den här filen
påstod att projektet var produktionsredo för 1000+ användare. Det stämde inte.**

---

## Kom igång

```bash
npm install          # installerar alla workspaces
npm run dev          # api + web parallellt, webben på :3002
npm run test:core    # affärslogiken — snabb, kräver ingenting
npm run verify       # type-check + lint + test + build
```

Kräver Node 20 eller senare.

---

## Struktur

```
123Hansa/
├── apps/
│   ├── web/        React 18 + Vite + Tailwind
│   └── api/        Express + Prisma + PostgreSQL
├── packages/
│   └── core/       @hansa/core — delad affärslogik, ingen runtime-koppling
└── docs/
```

`@hansa/core` innehåller allt som måste räknas likadant i webben och i API:t:
pengar, valuta, moms, provision, organisationsnummer och språkval. Paketet
importerar aldrig från React, Express eller Prisma — det är därför det går att
testa på 400 ms utan databas.

---

## De fem marknaderna

| Land | Valuta | Moms | Org.nr | Språk |
|---|---|---|---|---|
| Sverige | SEK | 25 / 12 / 6 % | 10 siffror, Luhn | `sv` |
| Norge | NOK | 25 / 15 / 12 % | 9 siffror, mod 11 | `no` |
| Danmark | DKK | 25 % | CVR, 8 siffror, mod 11 | `da` |
| Kroatien | EUR | 25 / 13 / 5 % | OIB, 11 siffror, ISO 7064 | `bs` |
| Bosnien | BAM | 17 % | JIB, 13 siffror | `bs` |

Land är en egenskap hos annonsen och styr valuta, moms, nummerformat, tidszon och
språk. Ingen komponent antar Sverige. Se `docs/COUNTRIES.md`.

`bs` täcker både Bosnien och Kroatien — skillnaden i latinsk skrift är ordval,
inte grammatik, och två nästan identiska ordböcker glider isär.

---

## Dokumentation

| Fil | Innehåll |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Reglerna som inte får brytas |
| [`docs/TODO.md`](docs/TODO.md) | Arbetslistan |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Systemet och vad som faktiskt är byggt |
| [`docs/COUNTRIES.md`](docs/COUNTRIES.md) | De fem marknaderna i detalj |
| [`docs/OPEN-QUESTIONS.md`](docs/OPEN-QUESTIONS.md) | Beslut som blockerar |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Förtroendegränser och åtkomstmatris |
| [`docs/TESTING.md`](docs/TESTING.md) | Vad som testas var |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Miljöer och driftsättning |
| [`docs/BUSINESS.md`](docs/BUSINESS.md) | Affärsmodellen |
| [`docs/PERSONUPPGIFTER.md`](docs/PERSONUPPGIFTER.md) | GDPR |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Designspråket |

---

## Bidra

Arbete sker på `dev`. `main` är produktion och tar bara emot godkända
sammanslagningar. Se [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## Licens

UNLICENSED — all rights reserved.
