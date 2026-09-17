# 123Hansa

Marknadsplats för **företagsaffärer** i Sverige, Norge och Danmark. Säljare
annonserar hela bolag och affärstillgångar, köpare hittar dem, och parterna gör
upp direkt med varandra.

**123Hansa är inte part i affären.** Plattformen förhandlar inte, tar inget bud,
håller inga pengar och upprättar inga avtal. Intäkterna kommer från listning,
betald exponering och abonnemang — aldrig provision på en genomförd affär. Den
gränsen är det som gör att marknadsplatsen kan drivas utan tillstånd, och den
ska inte korsas utan ett uttryckligt beslut i `docs/OPEN-QUESTIONS.md`.

Kroatien, och Bosnien och Serbien som köparsida, kommer i ett senare skede.
Crowdfunding byggs som ett **eget projekt** med eget bolag och ECSP-tillstånd —
inte i det här repot.

---

## Status 2026-09-17

**Under uppbyggnad. Ingenting är driftsatt än.** Allt nedan är byggt och provat
mot en lokal databas.

| Del | Läge |
|---|---|
| Affärslogik (`@hansa/core`) | 🟢 98 tester: pengar, land, moms, org.nr, språk, värdering |
| Databas (Supabase + RLS) | 🟢 Schema och 63 behörighetstester |
| Annonser, sökning, intresseanmälan | 🟢 Mot databasen |
| Inloggning och Min sida | 🟢 Supabase Auth |
| Meddelanden | 🟢 Realtid, efter accepterat intresse |
| Datarum med sekretessavtal och åtkomstlogg | 🟢 Byggt |
| Granskning av annonser | 🟢 `/admin/review` |
| Språk | 🟡 sv, no, da, en. Halva gränssnittet översatt |
| Drift (Vercel, Supabase i molnet) | 🔴 Inte uppsatt |
| Avgifter och betalning | 🔴 Prisnivåer inte beslutade |
| AML- och sanktionsscreening | 🔴 Inte byggd |

`docs/ARCHITECTURE.md` har hela tabellen. **Tidigare versioner av den här filen
påstod att projektet var produktionsredo för 1000+ användare. Det stämde inte**,
och det är därför statusen står här med siffror i stället för adjektiv.

---

## Kom igång

```bash
npm install

npm run db:start      # lokal Supabase i Docker (portarna 544xx)
npm run dev:web       # webben på localhost:3002

npm run test:core     # affärslogiken, kräver ingenting
npm run test:db       # behörigheten i databasen, kräver Docker
npm run verify        # type-check, lint, tester och bygge
```

Kopiera `.env.example` till `apps/web/.env.local` och fyll i `VITE_SUPABASE_URL`
och `VITE_SUPABASE_ANON_KEY` med värdena som `npm run db:start` skriver ut.

Öppna alltid appen på `localhost`, aldrig på `127.0.0.1` — Vite-servern är låst
till värdnamnet, och sidan renderas men blir aldrig klickbar annars.

---

## Struktur

```
apps/web/          React 18 + Vite + Tailwind
packages/core/     @hansa/core — delad affärslogik, ingen runtime-koppling
supabase/          migrationer med RLS, behörighetstester, serverfunktioner
docs/              besluten och arbetslistan, en fil per ämne
```

`@hansa/core` får aldrig importera React, Vite eller en databasklient. Pengar,
moms, valuta, organisationsnummer och språkval räknas där, på ett enda ställe,
och kan testas på 400 millisekunder utan databas.

---

## Läs vidare

| Dokument | Innehåll |
|---|---|
| `CLAUDE.md` | Reglerna som inte får brytas |
| `docs/TODO.md` | Arbetslistan, uppifrån |
| `docs/BUSINESS.md` | Affärsmodellen, marknaderna och konkurrenterna |
| `docs/OPEN-QUESTIONS.md` | Beslut som blockerar. Gissa dem inte i kod |
| `docs/ARCHITECTURE.md` | Vad som faktiskt är byggt |
| `docs/SECURITY.md` | Förtroendegränserna och åtkomstmatrisen |
| `docs/TESTING.md` | Vad som testas var, och vad ett grönt test bevisar |
| `docs/DEPLOYMENT.md` | Miljöer och driftsättning |
