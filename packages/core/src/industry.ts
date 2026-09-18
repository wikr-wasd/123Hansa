/**
 * Branschindelningen för annonser.
 *
 * Branschen lagras som en NYCKEL, aldrig som en text. Tidigare sparades den som
 * en svensk sträng — 'Bygg och anläggning' — direkt i annonsen, och följden var
 * att en dansk köpare läste svenska i ett i övrigt danskt gränssnitt, att
 * filtret gick sönder så fort någon stavade annorlunda, och att en norsk annons
 * aldrig kunde matcha en svensk sökning på samma bransch.
 *
 * Nyckeln är språkneutral. Översättningen ligger i ordböckerna under
 * `industry.<nyckel>`, och formuleringen kan ändras utan att data rörs.
 *
 * Listan är medvetet kort. En taxonomi med hundra poster ser noggrann ut men
 * fylls i på måfå, och då blir filtret sämre än ett med tolv val som faktiskt
 * stämmer. `other` finns för att en säljare aldrig ska tvingas ljuga.
 */

/**
 * Alla branscher, i den ordning de visas.
 *
 * `other` står sist med flit. Ett standardval som betyder "vet inte" högst upp
 * i en lista blir det alla väljer.
 */
export const INDUSTRY_KEYS = [
  'software',
  'ecommerce',
  'consulting',
  'accounting',
  'manufacturing',
  'construction',
  'retail',
  'food',
  'restaurant',
  'healthcare',
  'transport',
  'property_services',
  'other',
] as const;

export type Industry = (typeof INDUSTRY_KEYS)[number];

const KEYS = new Set<string>(INDUSTRY_KEYS);

/** Är strängen en känd bransch? Använd innan ett värde från klienten sparas. */
export function isIndustry(value: unknown): value is Industry {
  return typeof value === 'string' && KEYS.has(value);
}

/**
 * Översättningsnyckeln för en bransch.
 *
 * Finns för att ingen ska bygga strängen för hand på fyra ställen och stava
 * fel på ett av dem.
 */
export function industryTranslationKey(industry: Industry): string {
  return `industry.${industry}`;
}

/**
 * De svenska texter som användes innan branscherna blev nycklar, och vad de
 * motsvarar i dag.
 *
 * Migrationen i databasen gör samma översättning i SQL. Tabellen står kvar här
 * för att den som stöter på ett gammalt värde — i en export, en logg eller ett
 * fall migrationen inte täckte — ska kunna tolka det utan att gissa.
 */
export const LEGACY_SWEDISH_INDUSTRIES: Readonly<Record<string, Industry>> = {
  'IT och systemutveckling': 'software',
  'E-handel': 'ecommerce',
  'Konsult och tjänster': 'consulting',
  'Ekonomi och redovisning': 'accounting',
  Tillverkning: 'manufacturing',
  'Bygg och anläggning': 'construction',
  Detaljhandel: 'retail',
  Livsmedel: 'food',
  'Restaurang och café': 'restaurant',
  'Vård och hälsa': 'healthcare',
  'Transport och logistik': 'transport',
  Fastighetsservice: 'property_services',
  'Annan bransch': 'other',
};
