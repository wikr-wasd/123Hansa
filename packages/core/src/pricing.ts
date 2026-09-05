/**
 * Provision på en förmedlad affär.
 *
 * ⚠️ SATSERNA ÄR INTE BESLUTADE. Funktionerna här tar emot satsen som argument
 * och innehåller med flit ingen prislista. Det är ett affärsbeslut — se
 * docs/OPEN-QUESTIONS.md, fråga 1. Hårdkoda ingen provisionssats någonstans i
 * kodbasen förrän beslutet är fattat och skrivet i det dokumentet.
 *
 * Regel som gäller oavsett sats: KLIENTEN SKICKAR ALDRIG ETT PRIS. Servern
 * hämtar annonsens pris och räknar. Skickar klienten en egen summa används den
 * bara som kontroll — avviker den avbryts affären, den justeras aldrig tyst.
 */

import type { CountryCode } from './country.js';
import { applyBasisPoints, money, subtract, type Money } from './money.js';
import { addVat, type VatBreakdown } from './vat.js';

export interface CommissionInput {
  /** Annonsens pris — hämtat av servern, aldrig skickat av klienten. */
  readonly salePrice: Money;
  /** Provisionssatsen i baspunkter. 340 = 3,40 %. */
  readonly rateBasisPoints: number;
  /** Lägsta provision. Utelämnas när ingen miniminivå gäller. */
  readonly minimumFee?: Money;
  /** Högsta provision, om affären har ett tak. */
  readonly maximumFee?: Money;
  /** Säljarens land — styr momssats och valutakontroll. */
  readonly country: CountryCode;
  /** Momssats på provisionen i baspunkter. Ska vara tillåten i landet. */
  readonly vatRateBasisPoints: number;
}

export interface CommissionResult {
  /** Provisionen före moms, efter golv och tak. */
  readonly fee: Money;
  /** Provisionen med moms utbruten. */
  readonly breakdown: VatBreakdown;
  /** Vad säljaren får ut: försäljningspris minus provision inklusive moms. */
  readonly sellerPayout: Money;
  /** Om golvet eller taket slog in — visas för säljaren, aldrig tyst. */
  readonly adjustedBy?: 'minimum' | 'maximum';
}

export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PricingError';
  }
}

export function calculateCommission(input: CommissionInput): CommissionResult {
  const { salePrice, rateBasisPoints, minimumFee, maximumFee, country, vatRateBasisPoints } = input;

  if (salePrice.amount <= 0) {
    throw new PricingError('Försäljningspriset måste vara större än noll');
  }
  if (rateBasisPoints < 0) {
    throw new PricingError(`Provisionssatsen kan inte vara negativ, fick ${rateBasisPoints}`);
  }
  for (const bound of [minimumFee, maximumFee]) {
    if (bound && bound.currency !== salePrice.currency) {
      throw new PricingError(
        `Gräns i ${bound.currency} går inte att jämföra med ett pris i ${salePrice.currency}`,
      );
    }
  }
  if (minimumFee && maximumFee && minimumFee.amount > maximumFee.amount) {
    throw new PricingError('Lägsta provision är högre än högsta provision');
  }

  let fee = applyBasisPoints(salePrice, rateBasisPoints);
  let adjustedBy: 'minimum' | 'maximum' | undefined;

  if (minimumFee && fee.amount < minimumFee.amount) {
    fee = minimumFee;
    adjustedBy = 'minimum';
  } else if (maximumFee && fee.amount > maximumFee.amount) {
    fee = maximumFee;
    adjustedBy = 'maximum';
  }

  const breakdown = addVat(fee, country, vatRateBasisPoints);

  return {
    fee,
    breakdown,
    sellerPayout: subtract(salePrice, breakdown.gross),
    ...(adjustedBy ? { adjustedBy } : {}),
  };
}

/**
 * Kontrollerar en summa klienten räknat fram mot serverns egen uträkning.
 *
 * Avviker den ska affären AVBRYTAS, inte justeras. En tyst justering döljer
 * antingen en bugg i klienten eller ett försök att manipulera priset, och båda
 * ska synas.
 */
export function verifyClientTotal(expected: Money, claimed: Money): boolean {
  return expected.currency === claimed.currency && expected.amount === claimed.amount;
}

/** Ett belopp på noll i rätt valuta, för annonser utan angivet pris. */
export function noPrice(currency: Money['currency']): Money {
  return money(0, currency);
}
