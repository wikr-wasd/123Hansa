# Säkerhet

## Vad som faktiskt står på spel

De flesta marknadsplatser läcker e-postadresser om de går sönder. 123Hansa lagrar
**årsredovisningar, kundlistor, avtal och ägarstrukturer för bolag som är till
salu**. Ett läckage där skadar säljaren i konkurrens, inte bara i integritet — och
det räcker att en "köpare" som egentligen är en konkurrent får läsa materialet.

Det är därför due diligence-åtkomst kräver signerat sekretessavtal och loggas
oföränderligt. Se punkt 6 nedan.

⚠️ **Nuläge:** det mesta i det här dokumentet beskriver hur det **ska** vara.
Se `ARCHITECTURE.md` för vad som är byggt. Skillnaden är stor och ska inte
missförstås.

---

## 1. Åtkomstkontroll i tre lager

Alla tre krävs. Inget lager får tas bort.

| Lager | Vad det gör | Vad det INTE gör |
|---|---|---|
| **Klient** | Döljer det användaren inte får se | Skyddar någonting. Det är UX |
| **API** | Verifierar rollen server-side i varje route | — |
| **Databas** | Radnivåpolicy eller motsvarande begränsning | — |

**Middleware räcker ALDRIG ensamt för att skydda ett API.** Lärdomen kommer från
123Connect: ett direktanrop mot en route går inte genom klientens router, och en
route som litar på middleware är oskyddad så fort någon anropar den med curl.

En ny skyddad yta ska läggas till i **alla tre** lagren i samma commit.

---

## 2. Åtkomstmatris

| Yta | Gäst | Registrerad | Verifierad säljare | Köpare med NDA | Admin |
|---|---|---|---|---|---|
| Publika annonser (bransch, ort, prisspann) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Kontaktuppgifter till säljare | ❌ | ❌ | — | ✅ | ✅ |
| Skapa annons | ❌ | ❌ | ✅ | — | ✅ |
| Due diligence-dokument | ❌ | ❌ | egna | ✅ efter NDA | ✅ loggat |
| Lägga bud | ❌ | ❌ | — | ✅ | ❌ |
| Adminpanel | ❌ | ❌ | ❌ | ❌ | ✅ + MFA |
| `/api/admin/*` | ❌ | ❌ | ❌ | ❌ | ✅ server-side verifierat |

Rollen ska läsas från en källa **klienten inte kan sätta**. Ett fält i en JWT som
klienten själv skickar med är inte en sådan källa om det inte är signerat av
servern och verifierat vid varje anrop.

---

## 3. Klienten skickar aldrig ett pris

Se `CLAUDE.md`, regel 2. Det är lika mycket en säkerhetsregel som en
korrekthetsregel: en klient som får skicka sin egen summa kan skicka vilken som
helst.

`verifyClientTotal()` finns för kontrollen. Avviker summan **avbryts affären** —
den justeras aldrig tyst. En tyst justering döljer antingen en bugg eller ett
manipulationsförsök, och båda ska synas.

---

## 4. Inloggning

- **Kontolåsning** efter upprepade misslyckade försök, i ett tidsfönster. Även
  korrekt lösenord ska avvisas under låsningen — annars är låsningen bara en
  fördröjning.
- **Per-IP-gräns** på autentiseringsrutter.
- **MFA obligatoriskt** för adminytor.
- **Sessioner i cookies**, inte i `localStorage`. En XSS läser `localStorage`;
  en `HttpOnly`-cookie kan den inte röra.
- Låsning och gränser ska ligga så nära autentiseringen som möjligt, helst i
  databasen eller auth-tjänsten — inte bara i applikationskoden, som går att
  kringgå med ett direktanrop.

---

## 5. Sekretess och dokument

- Due diligence-material ligger **aldrig** på en publikt gissningsbar URL.
- Åtkomst ges per dokument och per användare, med giltighetstid.
- **Varje läsning loggas**: vem, vad, när, från vilken IP.
- Loggen är **oföränderlig** — triggers som blockerar UPDATE och DELETE. En logg
  som går att ändra bevisar ingenting den dag den behövs.
- Signerat sekretessavtal är ett villkor som kontrolleras i **API:t**, inte bara
  genom att knappen är dold i gränssnittet.

---

## 6. Personuppgifter

Se `PERSONUPPGIFTER.md`. Kort:

- Fyra av fem marknader ligger inom GDPR. **Bosnien står utanför EU** men har egen
  dataskyddslag, och en överföring dit är en tredjelandsöverföring.
- Ett organisationsnummer för enskild firma **är en personuppgift** — därför
  avvisar `validateSeOrgNumber()` tiosiffriga nummer som ser ut som personnummer.

---

## 7. Hemligheter

- Inga hemligheter i repot. `.env` är i `.gitignore` och bara `.env.example`
  checkas in. Det stämde vid genomgången 2026-09-05 och ska fortsätta stämma.
- Nycklar sätts i Vercels miljövariabler, aldrig i `vercel.json`. Den gamla
  konfigurationen hade hårdkodade staging-URL:er i `env`-blocket; de är borta.
- Roterar du en nyckel: kontrollera att den inte ligger kvar i git-historiken.
  Ett borttaget hemlighetsvärde är fortfarande läsbart i en gammal commit.

---

## 8. Säkerhetsheaders

Sätts i `vercel.json`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — kamera och mikrofon avstängda
- `Strict-Transport-Security` med preload

`X-XSS-Protection` är **borttagen med flit**. Den är utfasad och i vissa äldre
browsers introducerade den själv en sårbarhet. En header som inte gör något är
inte gratis — den ger falsk trygghet i en granskning.

**CSP saknas fortfarande.** Den ska in, och som i systerprojekten börjar den i
`Content-Security-Policy-Report-Only` tills rapporterna är rena. En CSP som
slås på skarpt direkt tar ner sidan på det första inline-skriptet.

---

## 9. Att rapportera en sårbarhet

Rapportera till William direkt, inte i ett publikt GitHub-issue. Repot är
publikt — ett issue med en fungerande reproduktion är en publicerad exploit.
