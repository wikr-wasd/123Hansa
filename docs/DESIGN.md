# Designspråket

## Utgångspunkten

123Hansa följer **123Connect Design System**, samma som systerprodukterna:
handlingsrött `#dc2626`, vita kort på `#f3f4f6`, rundade hörn och låga skuggor.

Byggstenarna definieras **en gång** i Tailwind-konfigurationen och de globala
stilarna. Skriv aldrig en egen knapp eller ett eget fält i en komponent — en
knapp som definieras lokalt blir den knapp som inte uppdateras när resten gör det.

## Vad som är annorlunda här

123Hansa säljer **företag**, inte varor. Tonen ska ligga närmare en bank än en
marknadsplats: en köpare som överväger att lägga tiotals miljoner ska inte mötas
av rea-estetik.

- **Inga brådskesignaler.** Inga nedräkningar, inga "3 personer tittar på detta
  nu". På ett bolagsköp är de inte bara smaklösa — de är vilseledande, och på en
  reglerad marknad är vilseledande marknadsföring ett juridiskt problem.
- **Siffror ska gå att lita på.** Omsättning, resultat och pris presenteras med
  `formatMoney()` i annonsens egen valuta, aldrig omräknat till läsarens. En
  omräknad siffra är en gissning om en växelkurs vid en viss tidpunkt.
- **Grönt betyder verifierat, inte "bra".** Verifieringsmärket är det viktigaste
  visuella elementet i en annonslista — det är det som skiljer plattformen från
  en anslagstavla.

## Färger

| Roll | Färg |
|---|---|
| Handling | `#dc2626` |
| Bakgrund | `#f3f4f6` |
| Kort | vitt |
| Verifierat | grönt |
| Ej verifierat / varning | gult |

Inget blått som konkurrerar med handlingsfärgen.

## Typografi och fem språk

Fem språk betyder att texter blir olika långa. Bosniska och danska strängar är
regelmässigt längre än de svenska de översatts från.

- **Bygg aldrig en layout som förutsätter en textlängd.** En knapp med fast bredd
  spricker på `bs`.
- **Ingen text i bilder.** Den går inte att översätta.
- Datum och tal formateras med **landets** `intlLocale`, inte med läsarens språk.
  En kroatisk annons visas med kroatisk sifferformatering även för en svensk
  läsare, eftersom priset är i euro.

## Responsivt

Obligatoriskt, inte en efterrätt. En stor del av trafiken i Kroatien och Bosnien
är mobil, och en desktop-först-layout stänger ute två marknader lika effektivt
som ett saknat språk.
