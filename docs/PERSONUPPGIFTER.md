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
