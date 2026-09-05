# Att arbeta i 123Hansa

Reglerna står i **[`CLAUDE.md`](CLAUDE.md)**. Läs den först. Den här filen är
det praktiska.

## Kom igång

```bash
npm install
npm run dev
npm run test:core
```

Node 20 eller senare.

## Brancher

`dev` är arbetsbranchen. `main` är produktion och tar bara emot godkända
sammanslagningar — committa aldrig direkt på den.

```bash
git checkout dev
# arbeta, committa, pusha
git push origin dev
```

Sammanslagning till `main` sker först när William uttryckligen godkänt en
preview. Se [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Innan du öppnar en PR

```bash
npm run verify
```

Och prova funktionen i appen. `verify` grönt bevisar att affärslogiken stämmer
och att koden kompilerar — inte att en sida hämtar sin data från API:t. Se
[`docs/TESTING.md`](docs/TESTING.md).

## De fyra reglerna som oftast bryts

1. **Pengar är heltal i minsta enhet.** 12,00 SEK är `1200`. Ingen float, ingen
   division med 100 — `formatMoney()` sköter presentationen.
2. **Ingen hårdkodad marknad.** Inget `SEK`, `Sverige` eller `sv-SE` i en
   komponent. Läs landets uppgifter ur `@hansa/core`.
3. **Inga halvfärdiga skal.** Alla knappar har handlers, alla formulär sparar,
   all data går att skapa, läsa, ändra och ta bort.
4. **Gissa inte ett affärsbeslut.** Provisionssats, betalleverantör och
   verifieringskrav är Williams beslut. Skriv frågan i
   [`docs/OPEN-QUESTIONS.md`](docs/OPEN-QUESTIONS.md) i stället för att anta
   något i kod.

## Kodstil

- Filnamn i kebab-case, komponenter i PascalCase, funktioner i camelCase
- TypeScript strict — inga undantag som smiter förbi typkontrollen
- Kommentarer förklarar **varför**, inte vad. Koden säger redan vad

## Commit-meddelanden

Skriv vad ändringen gör och varför. Historiken innehåller redan både svenska och
engelska om vartannat, vilket gör den svår att läsa — håll dig till ett språk
inom en PR.
