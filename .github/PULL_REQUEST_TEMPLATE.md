## Vad ändras

<!-- Vad gör den här ändringen, och varför? Inte vilka filer — vilket problem. -->

## Hur vet vi att det fungerar

<!-- Vad har du KÖRT? "npm run verify grönt" räcker inte för en funktion som rör
     en sida — det bevisar att logiken stämmer, inte att sidan hämtar sin data.
     Se docs/TESTING.md. -->

- [ ] `npm run verify` är grönt
- [ ] Funktionen är provad i appen, inte bara i test
- [ ] Inga placeholders, döda knappar eller TODO som skickas som klart

## Om ändringen rör pengar

- [ ] Belopp är heltal i minsta enhet — ingen float, ingen `/ 100`
- [ ] Uträkningen ligger i `@hansa/core`, inte i en komponent
- [ ] Klienten skickar inget pris

## Om ändringen rör land eller språk

- [ ] Inget hårdkodat `SEK`, `Sverige` eller `sv-SE`
- [ ] Alla fem länderna fungerar, inte bara Sverige
- [ ] Nya texter finns i alla språk, inte bara svenska

## Öppna frågor

<!-- Har du behövt anta något som egentligen är Williams beslut?
     Skriv det här och lägg in det i docs/OPEN-QUESTIONS.md — gissa inte i kod. -->
