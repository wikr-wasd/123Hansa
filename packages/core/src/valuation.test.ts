import { describe, expect, it } from 'vitest';
import { estimateValuation, INDUSTRY_MULTIPLES, ValuationError } from './valuation.js';

describe('estimateValuation', () => {
  const base = {
    revenueMinor: 500_000_000, // 5 000 000,00 SEK
    currency: 'SEK' as const,
    industry: 'consulting' as const,
  };

  it('använder rörelseresultatet när det finns och är positivt', () => {
    const result = estimateValuation({ ...base, ebitMinor: 80_000_000 });
    expect(result.method).toBe('ebit');
    expect(result.low.amount).toBe(80_000_000 * INDUSTRY_MULTIPLES.consulting.ebitLow);
    expect(result.high.amount).toBe(80_000_000 * INDUSTRY_MULTIPLES.consulting.ebitHigh);
  });

  it('faller tillbaka på omsättning när rörelseresultat saknas', () => {
    const result = estimateValuation(base);
    expect(result.method).toBe('revenue');
    expect(result.assumptions.some((a) => a.includes('Rörelseresultat saknas'))).toBe(true);
  });

  it('faller tillbaka på omsättning vid förlust, och säger varför', () => {
    const result = estimateValuation({ ...base, ebitMinor: -1_000_000 });
    expect(result.method).toBe('revenue');
    expect(result.assumptions.some((a) => a.includes('inget positivt rörelseresultat'))).toBe(true);
  });

  it('ger alltid heltal i minsta enhet', () => {
    const result = estimateValuation({ ...base, revenueMinor: 333_333_333 });
    for (const value of [result.low, result.mid, result.high]) {
      expect(Number.isInteger(value.amount)).toBe(true);
    }
  });

  it('behåller valutan och blandar aldrig ihop två', () => {
    const norwegian = estimateValuation({ ...base, currency: 'NOK' });
    expect(norwegian.low.currency).toBe('NOK');
    expect(norwegian.mid.currency).toBe('NOK');
    expect(norwegian.high.currency).toBe('NOK');
  });

  it('håller ordningen låg ≤ mitt ≤ hög', () => {
    const cases = [
      { ...base },
      { ...base, ebitMinor: 1 },
      { ...base, ebitMinor: 80_000_000, employees: 1, yearsInBusiness: 1 },
      { ...base, revenueMinor: 0 },
    ];
    for (const input of cases) {
      const result = estimateValuation(input);
      expect(result.low.amount).toBeLessThanOrEqual(result.mid.amount);
      expect(result.mid.amount).toBeLessThanOrEqual(result.high.amount);
    }
  });

  it('sänker nedre delen av spannet för en ung verksamhet', () => {
    const established = estimateValuation({ ...base, ebitMinor: 80_000_000, yearsInBusiness: 10 });
    const young = estimateValuation({ ...base, ebitMinor: 80_000_000, yearsInBusiness: 1 });
    expect(young.low.amount).toBeLessThan(established.low.amount);
    expect(young.high.amount).toBe(established.high.amount);
  });

  it('sänker värdet för ett enmansbolag', () => {
    const withStaff = estimateValuation({ ...base, ebitMinor: 80_000_000, employees: 8 });
    const soloOwner = estimateValuation({ ...base, ebitMinor: 80_000_000, employees: 1 });
    expect(soloOwner.low.amount).toBeLessThan(withStaff.low.amount);
    expect(soloOwner.high.amount).toBeLessThan(withStaff.high.amount);
    expect(soloOwner.assumptions.some((a) => a.includes('drivs av en person'))).toBe(true);
  });

  it('svarar alltid med sina antaganden, och säger att det är en schablon', () => {
    const result = estimateValuation(base);
    expect(result.assumptions.length).toBeGreaterThan(0);
    expect(result.assumptions.some((a) => a.includes('inte en värdering'))).toBe(true);
  });

  it('använder branschens egna multiplar', () => {
    const software = estimateValuation({ ...base, industry: 'software', ebitMinor: 10_000_000 });
    const restaurant = estimateValuation({ ...base, industry: 'restaurant', ebitMinor: 10_000_000 });
    expect(software.high.amount).toBeGreaterThan(restaurant.high.amount);
  });

  it('vägrar belopp som inte är heltal i minsta enhet', () => {
    expect(() => estimateValuation({ ...base, revenueMinor: 5_000_000.5 })).toThrow(ValuationError);
    expect(() => estimateValuation({ ...base, ebitMinor: 12.5 })).toThrow(ValuationError);
  });

  it('vägrar negativ omsättning och orimliga uppgifter', () => {
    expect(() => estimateValuation({ ...base, revenueMinor: -1 })).toThrow(ValuationError);
    expect(() => estimateValuation({ ...base, yearsInBusiness: -2 })).toThrow(ValuationError);
    expect(() => estimateValuation({ ...base, employees: -1 })).toThrow(ValuationError);
    expect(() => estimateValuation({ ...base, employees: 2.5 })).toThrow(ValuationError);
  });

  it('ger noll för ett bolag utan omsättning, inte ett negativt värde', () => {
    const result = estimateValuation({ ...base, revenueMinor: 0 });
    expect(result.low.amount).toBe(0);
    expect(result.high.amount).toBe(0);
  });
});
