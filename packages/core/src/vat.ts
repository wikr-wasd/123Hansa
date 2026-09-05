/**
 * Moms räknas på ett enda ställe. Duplicera aldrig uträkningen i en komponent,
 * en route handler eller en SQL-vy — två kopior glider isär, och då visar
 * fakturan en summa servern räknar annorlunda.
 *
 * Satsen kommer ur landet (COUNTRY_INFO.vatRates) och anges i baspunkter.
 */

import { isAllowedVatRate, type CountryCode } from './country.js';
import { money, roundHalfUp, type Money } from './money.js';

export interface VatBreakdown {
  /** Beloppet exklusive moms. */
  readonly net: Money;
  /** Momsbeloppet. */
  readonly vat: Money;
  /** Beloppet inklusive moms. net + vat, alltid exakt. */
  readonly gross: Money;
  /** Satsen i baspunkter. 2500 = 25 %. */
  readonly rate: number;
}

export class VatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VatError';
  }
}

function assertAllowed(country: CountryCode, rate: number): void {
  if (!isAllowedVatRate(country, rate)) {
    throw new VatError(
      `${rate / 100} % är inte en tillåten momssats i ${country}. ` +
        `Satsen måste finnas i COUNTRY_INFO.${country}.vatRates.`,
    );
  }
}

/** Lägger moms på ett nettobelopp. */
export function addVat(net: Money, country: CountryCode, rate: number): VatBreakdown {
  assertAllowed(country, rate);
  const vatAmount = roundHalfUp((net.amount * rate) / 10_000);
  return {
    net,
    vat: money(vatAmount, net.currency),
    gross: money(net.amount + vatAmount, net.currency),
    rate,
  };
}

/**
 * Bryter ut momsen ur ett bruttobelopp.
 *
 * Nettot räknas som brutto minus moms — inte som brutto / (1 + sats) avrundat
 * för sig. Räknas båda leden var för sig kan de skilja en minsta enhet, och då
 * summerar inte fakturaraderna till totalen.
 */
export function extractVat(gross: Money, country: CountryCode, rate: number): VatBreakdown {
  assertAllowed(country, rate);
  const vatAmount = roundHalfUp((gross.amount * rate) / (10_000 + rate));
  return {
    net: money(gross.amount - vatAmount, gross.currency),
    vat: money(vatAmount, gross.currency),
    gross,
    rate,
  };
}
