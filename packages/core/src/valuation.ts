/**
 * Grov värdering av ett bolag, utifrån branschmultiplar.
 *
 * Det här är en SCHABLON, inte en värdering. Den finns för att en säljare ska
 * få en storleksordning innan hen lägger upp en annons — inte för att ersätta
 * en revisor eller en due diligence.
 *
 * Tre regler styr modulen:
 *
 * 1. Den är deterministisk och går att förklara rad för rad. Ett värde som
 *    kommer ur en modell ingen kan redogöra för är ett värde ingen kan stå för,
 *    och en säljare som sätter fel pris på sitt livsverk kommer att fråga varför.
 * 2. Pengar är heltal i minsta enhet, och valutan följer med hela vägen
 *    (CLAUDE.md regel 1). Belopp i olika valutor blandas aldrig.
 * 3. Resultatet innehåller alltid sina antaganden. Den som visar ett spann utan
 *    att säga vad det bygger på ljuger med statistik.
 *
 * Multiplarna nedan är grova marknadsschabloner för små och medelstora nordiska
 * bolag. De är INTE härledda ur 123Hansas egen affärsdata — den finns inte än.
 * När plattformen har genomförda affärer ska de ersättas av faktiska utfall, och
 * då ska källan stå här.
 */

import { type CurrencyCode } from './country.js';
import { type Industry } from './industry.js';
import { money, type Money } from './money.js';

export class ValuationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValuationError';
  }
}

/**
 * Branscher med egna multiplar.
 *
 * Det här är SAMMA lista som annonsernas — se `industry.ts`. Det är avsiktligt:
 * `INDUSTRY_MULTIPLES` nedan är typad som `Record<Industry, …>`, så en ny
 * bransch går inte att lägga till utan att någon tar ställning till dess
 * multipel. Två separata listor hade i stället gett en bransch som tyst faller
 * tillbaka på `other` utan att någon märker det.
 */
export type ValuationIndustry = Industry;

export interface IndustryMultiples {
  /** Multipel på rörelseresultat (EBIT), låg och hög. */
  readonly ebitLow: number;
  readonly ebitHigh: number;
  /** Multipel på omsättning, låg och hög. Används bara när EBIT saknas. */
  readonly revenueLow: number;
  readonly revenueHigh: number;
}

/**
 * Multipel per bransch.
 *
 * Typen är `Record<Industry, …>` och inte `Partial<…>` med flit: lägger någon
 * till en bransch i `INDUSTRY_KEYS` utan multipel går bygget sönder, i stället
 * för att branschen tyst värderas som `other`.
 */
export const INDUSTRY_MULTIPLES: Readonly<Record<Industry, IndustryMultiples>> = {
  software: { ebitLow: 6, ebitHigh: 12, revenueLow: 1.2, revenueHigh: 3 },
  ecommerce: { ebitLow: 4, ebitHigh: 8, revenueLow: 0.6, revenueHigh: 1.5 },
  consulting: { ebitLow: 3, ebitHigh: 6, revenueLow: 0.4, revenueHigh: 0.9 },
  // Redovisningsbyråer värderas normalt högre än konsulter i övrigt: intäkten är
  // återkommande och kundstocken byter sällan byrå. Spannet är ändå en schablon
  // som ska ersättas av faktiska utfall, precis som de andra.
  accounting: { ebitLow: 4, ebitHigh: 7, revenueLow: 0.8, revenueHigh: 1.4 },
  manufacturing: { ebitLow: 4, ebitHigh: 7, revenueLow: 0.5, revenueHigh: 1.1 },
  construction: { ebitLow: 3, ebitHigh: 5.5, revenueLow: 0.3, revenueHigh: 0.7 },
  retail: { ebitLow: 3, ebitHigh: 6, revenueLow: 0.3, revenueHigh: 0.8 },
  // Livsmedel: låga marginaler och hög omsättning, så omsättningsmultipeln är
  // den lägsta i tabellen. Att värdera ett livsmedelsbolag på omsättning ger
  // nästan alltid fel svar — EBIT ska användas när det finns.
  food: { ebitLow: 3.5, ebitHigh: 6, revenueLow: 0.2, revenueHigh: 0.5 },
  restaurant: { ebitLow: 2.5, ebitHigh: 5, revenueLow: 0.3, revenueHigh: 0.7 },
  healthcare: { ebitLow: 5, ebitHigh: 9, revenueLow: 0.8, revenueHigh: 1.6 },
  transport: { ebitLow: 3, ebitHigh: 6, revenueLow: 0.4, revenueHigh: 0.9 },
  property_services: { ebitLow: 3.5, ebitHigh: 6.5, revenueLow: 0.4, revenueHigh: 0.9 },
  other: { ebitLow: 3, ebitHigh: 6, revenueLow: 0.4, revenueHigh: 0.9 },
};

export interface ValuationInput {
  /** Årsomsättning i minsta enhet. */
  readonly revenueMinor: number;
  /** Rörelseresultat (EBIT) i minsta enhet. Får vara negativt. */
  readonly ebitMinor?: number;
  readonly currency: CurrencyCode;
  readonly industry: ValuationIndustry;
  /** Antal år verksamheten funnits. Påverkar spannet, inte mittvärdet. */
  readonly yearsInBusiness?: number;
  /** Antal anställda. Ett bolag som står och faller med ägaren värderas lägre. */
  readonly employees?: number;
}

export type ValuationMethod = 'ebit' | 'revenue';

export interface ValuationResult {
  readonly low: Money;
  readonly mid: Money;
  readonly high: Money;
  readonly method: ValuationMethod;
  /** Vad beräkningen bygger på, i klartext. Visas alltid tillsammans med spannet. */
  readonly assumptions: string[];
}

function requireInteger(value: number, name: string): void {
  if (!Number.isInteger(value)) {
    throw new ValuationError(`${name} måste vara heltal i minsta enhet, fick ${value}`);
  }
  if (!Number.isSafeInteger(value)) {
    throw new ValuationError(`${name} ligger utanför säkert heltalsintervall: ${value}`);
  }
}

/**
 * Räknar fram ett värderingsspann.
 *
 * EBIT används när det finns och är positivt — ett bolag köps för vad det tjänar.
 * Saknas EBIT, eller går bolaget med förlust, faller modellen tillbaka på
 * omsättning, och det sägs rakt ut i antagandena.
 */
export function estimateValuation(input: ValuationInput): ValuationResult {
  const { revenueMinor, ebitMinor, currency, industry, yearsInBusiness, employees } = input;

  requireInteger(revenueMinor, 'Omsättning');
  if (revenueMinor < 0) {
    throw new ValuationError('Omsättning kan inte vara negativ');
  }
  if (ebitMinor !== undefined) {
    requireInteger(ebitMinor, 'Rörelseresultat');
  }
  if (yearsInBusiness !== undefined && (!Number.isFinite(yearsInBusiness) || yearsInBusiness < 0)) {
    throw new ValuationError('Antal år kan inte vara negativt');
  }
  if (employees !== undefined && (!Number.isInteger(employees) || employees < 0)) {
    throw new ValuationError('Antal anställda måste vara ett heltal som inte är negativt');
  }

  const multiples = INDUSTRY_MULTIPLES[industry];
  const assumptions: string[] = [];

  const useEbit = ebitMinor !== undefined && ebitMinor > 0;
  const method: ValuationMethod = useEbit ? 'ebit' : 'revenue';

  let low: number;
  let high: number;

  if (useEbit) {
    low = (ebitMinor as number) * multiples.ebitLow;
    high = (ebitMinor as number) * multiples.ebitHigh;
    assumptions.push(
      `Räknat på rörelseresultatet med multipel ${multiples.ebitLow}–${multiples.ebitHigh} för branschen.`
    );
  } else {
    low = revenueMinor * multiples.revenueLow;
    high = revenueMinor * multiples.revenueHigh;
    assumptions.push(
      `Räknat på omsättningen med multipel ${multiples.revenueLow}–${multiples.revenueHigh} för branschen.`
    );
    if (ebitMinor !== undefined && ebitMinor <= 0) {
      assumptions.push(
        'Bolaget redovisar inget positivt rörelseresultat, så omsättningen används i stället. Ett bolag utan vinst värderas i praktiken på vad köparen tror sig kunna göra med verksamheten.'
      );
    } else {
      assumptions.push('Rörelseresultat saknas. Med det blir spannet betydligt smalare.');
    }
  }

  // Ung verksamhet: mindre historik att luta sig mot, alltså större osäkerhet nedåt.
  if (yearsInBusiness !== undefined && yearsInBusiness < 3) {
    low *= 0.8;
    assumptions.push('Verksamheten är yngre än tre år, vilket drar ned den nedre delen av spannet.');
  }

  // Ett bolag som står och faller med ägaren är svårare att sälja.
  if (employees !== undefined && employees <= 1) {
    low *= 0.7;
    high *= 0.85;
    assumptions.push(
      'Verksamheten drivs av en person. Köparen betalar för det som finns kvar när ägaren slutar, vilket sänker värdet.'
    );
  }

  assumptions.push(
    'Schablon utifrån branschmultiplar, inte en värdering. Skulder, avtal, kundberoende och ägarberoende kan ändra bilden i båda riktningar.'
  );

  const lowMinor = Math.max(0, Math.round(low));
  const highMinor = Math.max(lowMinor, Math.round(high));
  const midMinor = Math.round((lowMinor + highMinor) / 2);

  return {
    low: money(lowMinor, currency),
    mid: money(midMinor, currency),
    high: money(highMinor, currency),
    method,
    assumptions,
  };
}
