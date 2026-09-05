/**
 * Pengar i 123Hansa är ALLTID heltal i valutans minsta enhet.
 *
 * 12,00 SEK är 1200 (öre). Aldrig 12.0, aldrig "12,00", aldrig numeric i schemat.
 * Flyttal ackumulerar fel över en affär på tiotals miljoner, och ett kvitto som
 * inte går ihop på öret är ett kvitto ingen litar på.
 *
 * Konvertera först vid presentation, med formatMoney().
 */

import { CURRENCY_INFO, type CurrencyCode } from './country.js';

/** Ett belopp i minsta enhet, tillsammans med sin valuta. */
export interface Money {
  /** Heltal i minsta enhet: öre, cent, fening, øre. */
  readonly amount: number;
  readonly currency: CurrencyCode;
}

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MoneyError';
  }
}

export function money(amount: number, currency: CurrencyCode): Money {
  if (!Number.isInteger(amount)) {
    throw new MoneyError(
      `Belopp måste vara heltal i minsta enhet, fick ${amount}. ` +
        `12,00 ${currency} skrivs som 1200, inte som 12.`,
    );
  }
  if (!Number.isSafeInteger(amount)) {
    throw new MoneyError(`Belopp utanför säkert heltalsintervall: ${amount}`);
  }
  return { amount, currency };
}

export const zero = (currency: CurrencyCode): Money => money(0, currency);

/**
 * Belopp i olika valutor summeras aldrig. En plattformsöversikt som lägger
 * ihop BAM och SEK till "total omsättning" ljuger, och siffran är omöjlig att
 * felsöka i efterhand. Redovisa per valuta.
 */
function sameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new MoneyError(
      `Kan inte räkna med ${a.currency} och ${b.currency} i samma uttryck. ` +
        `Belopp i olika valutor summeras aldrig — redovisa per valuta.`,
    );
  }
}

export function add(a: Money, b: Money): Money {
  sameCurrency(a, b);
  return money(a.amount + b.amount, a.currency);
}

export function subtract(a: Money, b: Money): Money {
  sameCurrency(a, b);
  return money(a.amount - b.amount, a.currency);
}

export function sum(amounts: readonly Money[], currency: CurrencyCode): Money {
  return amounts.reduce((acc, m) => add(acc, m), zero(currency));
}

export function multiply(m: Money, factor: number): Money {
  return money(roundHalfUp(m.amount * factor), m.currency);
}

export function isZero(m: Money): boolean {
  return m.amount === 0;
}

export function isNegative(m: Money): boolean {
  return m.amount < 0;
}

export function compare(a: Money, b: Money): number {
  sameCurrency(a, b);
  return a.amount - b.amount;
}

/**
 * Avrundning halvt uppåt, symmetriskt kring noll.
 *
 * Math.round(-0.5) ger -0 i JavaScript — alltså uppåt mot noll — vilket gör att
 * en kreditnota inte blir spegelbilden av sin faktura. Här rundas -1,5 till -2.
 */
export function roundHalfUp(value: number): number {
  return value < 0 ? -Math.round(-value) : Math.round(value);
}

/**
 * Procentsatser är BASPUNKTER. 340 = 3,40 %. Aldrig 0.034.
 *
 * En procentsats som flyttal ger 0.1 + 0.2 !== 0.3 mitt i en avgiftsuträkning.
 */
export function applyBasisPoints(m: Money, basisPoints: number): Money {
  if (!Number.isInteger(basisPoints)) {
    throw new MoneyError(`Baspunkter måste vara heltal, fick ${basisPoints}. 3,40 % skrivs som 340.`);
  }
  return money(roundHalfUp((m.amount * basisPoints) / 10_000), m.currency);
}

/**
 * Delar ett belopp i n delar utan att tappa en enda minsta enhet.
 *
 * 1000 öre på 3 delar blir [334, 333, 333] — inte [333, 333, 333], som tappar
 * ett öre, och inte [333.33, ...], som inte är pengar.
 */
export function allocate(m: Money, parts: number): Money[] {
  if (!Number.isInteger(parts) || parts < 1) {
    throw new MoneyError(`Antal delar måste vara ett positivt heltal, fick ${parts}`);
  }
  const base = Math.trunc(m.amount / parts);
  let remainder = m.amount - base * parts;
  const step = remainder < 0 ? -1 : 1;
  return Array.from({ length: parts }, () => {
    let share = base;
    if (remainder !== 0) {
      share += step;
      remainder -= step;
    }
    return money(share, m.currency);
  });
}

/**
 * Formaterar för presentation. ENDA stället där division med valutans skala
 * får ske.
 *
 * decimalDigits kommer ur CURRENCY_INFO och hårdkodas aldrig till 2. Alla fem
 * marknaderna har i dag två decimaler, men mekanismen finns för att regeln ska
 * hålla den dag en valuta utan decimaler tillkommer — serbiska dinarer, som
 * systerprodukten Burp redan träffat på.
 */
export function formatMoney(m: Money, locale: string): string {
  const info = CURRENCY_INFO[m.currency];
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: m.currency,
    minimumFractionDigits: info.decimalDigits,
    maximumFractionDigits: info.decimalDigits,
  }).format(m.amount / 10 ** info.decimalDigits);
}

/**
 * Läser ett belopp som en människa skrivit i ett prisfält och returnerar
 * minsta enhet.
 *
 * "1 200,50" i ett svenskt fält är 120050 öre. I en nolldecimalsvaluta vore
 * samma sträng 1200 hela enheter — därför får denna funktion ALDRIG ersättas
 * med Math.round(x * 100).
 */
export function parseAmount(input: string, currency: CurrencyCode): Money {
  const info = CURRENCY_INFO[currency];
  const cleaned = input.replace(/[\s\u00a0']/g, '').replace(',', '.');
  if (cleaned === '' || !/^-?\d*\.?\d*$/.test(cleaned)) {
    throw new MoneyError(`Kan inte läsa "${input}" som ett belopp i ${currency}`);
  }
  const value = Number(cleaned);
  if (!Number.isFinite(value)) {
    throw new MoneyError(`Kan inte läsa "${input}" som ett belopp i ${currency}`);
  }
  if (info.decimalDigits === 0 && cleaned.includes('.')) {
    throw new MoneyError(`${currency} har inga decimaler — "${input}" är inte ett giltigt belopp`);
  }
  return money(roundHalfUp(value * 10 ** info.decimalDigits), currency);
}
