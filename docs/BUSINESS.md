# Affärsmodellen

## Vad 123Hansa säljer

En plats där en företagsaffär går att **genomföra**, inte bara annonseras.
Värdet ligger i det som händer efter första kontakten: verifierad motpart,
sekretessavtal, strukturerat due diligence-material, bud och avslut.

En annonssajt konkurrerar med Blocket och Bolagsplatsen på pris. En plattform som
bär affären hela vägen konkurrerar med företagsmäklare på arvode — och det är en
helt annan prisnivå.

## Intäktsströmmar — inte beslutade

⚠️ **Ingen prislista finns i kodbasen och ska inte finnas någon** förrän
`OPEN-QUESTIONS.md` fråga 1 är besvarad. `calculateCommission()` tar satsen som
argument med flit.

Tänkbara modeller, som beslutsunderlag och inte som beslut:

| Modell | För | Emot |
|---|---|---|
| Provision på avslut | Betalar sig bara när vi levererat värde | Ingen intäkt förrän första avslutet, som kan dröja månader |
| Annonsavgift | Kassaflöde från dag ett | Säljaren betalar utan att veta om det leder någonstans |
| Abonnemang för köpare | Förutsägbart | Köpare vill inte betala för att få leta |
| Betald exponering | Enkelt att bygga | Riskerar att sälja synlighet före relevans |

Frågorna måste besvaras tillsammans: procent eller trappa, slutpris eller
utropspris, golv, tak, vem som betalar, och vad som händer om affären avbryts
efter accepterat bud.

En affär på 50 miljoner med 3,4 % ger 1,7 miljoner i provision. Ingen säljare
accepterar det utan tak — och ett tak ändrar hela kalkylen för de stora
affärerna, som är de som bär plattformen.

## Marknaderna

Fem länder i två grupper med olika logik:

**Norden (SE, NO, DK)** — mogna marknader med etablerade företagsmäklare,
välfungerande register och e-legitimation. Hög konkurrens, hög betalningsvilja,
låg friktion i verifiering.

**Västra Balkan (HR, BA)** — färre etablerade aktörer, svagare digital
infrastruktur, ingen e-legitimation med samma täckning. Lägre betalningsvilja i
absoluta tal, men också lägre konkurrens. Bosnien är dessutom administrativt
delat i tre register.

Att bygga för båda grupperna samtidigt är ett medvetet val, men det betyder att
**ingen funktion får förutsätta BankID**. Ett verifieringskrav som bara går att
uppfylla i Norden stänger ute två av fem marknader utan att det syns som ett fel.
Se `OPEN-QUESTIONS.md` fråga 3.

## Vad som krävs för ett sjätte land

1. Ett svar på om provisionsmodellen bär i den marknadens prisnivå
2. Ett register att verifiera bolag mot
3. Ett sätt att verifiera en person utan e-legitimation, om sådan saknas
4. Momsfrågan löst med revisor
5. Språkbeslut: täcker en befintlig ordbok landet, eller behövs en ny?

Den tekniska delen är en post i `COUNTRY_INFO` och ett par timmar. Den är inte
det svåra — punkt 1 till 4 är det.
