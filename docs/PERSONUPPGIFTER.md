# Personuppgifter

⚠️ Det här dokumentet beskriver vad som **gäller**, inte vad som är byggt.
Registerförteckning, radering och export är inte implementerade. Se `TODO.md`.

## Fem länder, två regimer

| Land | Regim |
|---|---|
| Sverige, Danmark, Kroatien | GDPR direkt |
| Norge | GDPR genom EES-avtalet |
| **Bosnien** | **Utanför EU/EES.** Egen dataskyddslag |

En överföring av personuppgifter till Bosnien är en **tredjelandsöverföring** och
kräver egen rättslig grund. Det är den enskilt viktigaste dataskyddskonsekvensen
av att femte marknaden är Bosnien, och den går inte att lösa i efterhand.

Var data lagras är därför ett beslut som måste tas medvetet — inte något som
avgörs av vilken region någon råkade välja i Vercel eller hos
databasleverantören.

## Vad som samlas in

| Uppgift | Varför | Känslighet |
|---|---|---|
| Namn, e-post, telefon | Kontakt mellan parter | Normal |
| Organisationsnummer | Verifiera bolaget | Normal — **utom** för enskild firma |
| Företagets ekonomi | Underlag för köpare | Affärshemlighet |
| Due diligence-dokument | Genomföra affären | **Högst** |
| Meddelanden mellan parter | Affärskommunikation | Hög |
| IP och inloggningshistorik | Säkerhet | Normal |

## Det svenska särfallet

Ett svenskt organisationsnummer för **enskild firma är ägarens personnummer**.
Publiceras det i en annons är det både en personuppgift på öppet nät och en
identitetsstöldsrisk.

Därför avvisar `validateSeOrgNumber()` tiosiffriga nummer där tredje siffran är
under 2, med just den motiveringen i felmeddelandet. Det är en dataskyddsåtgärd
i kod, inte en formalitet — och den ska inte "lättas upp" för att någon tycker
att validatorn är sträng.

## Due diligence-material

Det känsligaste vi lagrar. Se `SECURITY.md`. Kort:

- Åtkomst kräver signerat sekretessavtal, kontrollerat i **API:t** och inte bara
  genom att knappen är dold
- Varje läsning loggas oföränderligt: vem, vad, när, varifrån
- Materialet ligger aldrig på en gissningsbar URL

## De registrades rättigheter

Måste byggas, inte utlovas:

- **Utdrag** — allt vi har om en person, i maskinläsbart format
- **Radering** — med undantag för det bokföringslagen kräver att vi behåller
- **Rättelse**
- **Invändning** mot behandling

En raderingsbegäran från en säljare vars affär är avslutad rör
bokföringsmaterial och kan inte hanteras med ett enkelt `DELETE`. Den behöver en
genomtänkt rutin **innan** första riktiga affären, inte efter.

## Gallring

Ingen gallringspolicy är beslutad. Se `OPEN-QUESTIONS.md`. Utan en samlas allt
för alltid, vilket är oförenligt med lagringsminimering — och gör varje framtida
läcka större än den behövde vara.

---

## AML- och sanktionsscreening

Beslutat 2026-09-15: screening från start, **även utan skyldighet** (se
`BUSINESS.md`). Den här delen är skriven innan en enda kontroll körts, vilket är
avsikten — en konsekvensbedömning efteråt är en efterhandskonstruktion.

### Vad som behandlas

| Uppgift | Varifrån | Känslighet |
|---|---|---|
| Namn, födelseår, land på den som registrerar sig | Användaren själv | Normal |
| Organisationsnummer och firmanamn | Användaren, senare bolagsregister | Normal |
| Verkliga huvudmän | Register eller uppgift från bolaget | Normal |
| **Träff mot sanktionslista** | EU:s och FN:s konsoliderade listor | **Hög** |
| **Träff mot PEP-lista** | Leverantör, inte beslutad | **Hög** |
| Granskarens beslut och motivering | Plattformen | Hög |

### Den svåra delen: rättslig grund

Sanktionsscreeningen vilar på att **förbudet att göra ekonomiska resurser
tillgängliga för listade personer gäller alla i EU**. Att kontrollera är i
praktiken nödvändigt för att inte bryta mot det, och behandlingen stöds av
rättslig förpliktelse och berättigat intresse.

PEP-screeningen är svagare. 123Hansa är inte verksamhetsutövare enligt
penningtvättslagen i dag. Den behandlingen vilar därför på **berättigat
intresse**, och kräver en intresseavvägning som dokumenteras här innan den slås
på.

⚠️ **Artikel 10.** Uppgifter om fällande domar och lagöverträdelser får bara
behandlas under myndighets kontroll eller med stöd i lag. En sanktionsträff är
inte i sig en uppgift om brott, men ligger nära, och vissa leverantörer levererar
"adverse media" som otvetydigt är det. **Adverse media ska vara avstängt** tills
en jurist sagt annat.

### Krav på bygget

1. **DPIA innan första skarpa körningen.** Den här texten är underlaget, inte
   bedömningen. Bedömningen görs med jurist och dateras.
2. **Ingen automatisk avslagsgrund.** En träff stoppar publicering och
   datarumsåtkomst, men beslutet fattas av en människa och motiveras. Ett
   automatiserat beslut med rättslig följd skulle falla under artikel 22.
3. **Falska träffar är normalfallet.** Namnlikhet är trubbigt. Den som stoppas
   ska få veta att en kontroll gjorts och kunna invända — annars är avslaget
   osynligt för den som drabbas.
4. **Loggen bevaras, resultatet gallras.** Att en kontroll gjorts, av vem och med
   vilket beslut sparas. Leverantörens råsvar med träfflistor gallras enligt
   policy som inte är beslutad — se `OPEN-QUESTIONS.md`.
5. **Leverantören är personuppgiftsbiträde.** Biträdesavtal krävs, och en
   kontroll av var de behandlar uppgifterna. En leverantör utanför EU/EES kräver
   överföringsgrund.
6. **Registrerade måste informeras** om att screening sker, i integritetspolicyn
   och vid registreringen. Att screena tyst är att behandla i hemlighet.
