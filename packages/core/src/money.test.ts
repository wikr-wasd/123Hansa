import { describe, expect, it } from 'vitest';
import {
  add, allocate, applyBasisPoints, compare, formatMoney, money, MoneyError,
  multiply, parseAmount, roundHalfUp, subtract, sum, zero,
} from './money.js';

describe('money', () => {
  it('vägrar flyttal — 12,00 SEK är 1200, inte 12', () => {
    expect(() => money(12.5, 'SEK')).toThrow(MoneyError);
    expect(() => money(0.1, 'EUR')).toThrow(MoneyError);
    expect(money(1200, 'SEK').amount).toBe(1200);
  });

  it('summerar aldrig olika valutor', () => {
    expect(() => add(money(100, 'SEK'), money(100, 'NOK'))).toThrow(/summeras aldrig/);
    expect(() => compare(money(100, 'BAM'), money(100, 'EUR'))).toThrow();
  });

  it('räknar i alla fem valutor', () => {
    expect(add(money(1000, 'SEK'), money(500, 'SEK')).amount).toBe(1500);
    expect(subtract(money(1000, 'NOK'), money(2500, 'NOK')).amount).toBe(-1500);
    expect(sum([money(100, 'DKK'), money(250, 'DKK')], 'DKK').amount).toBe(350);
    expect(multiply(money(333, 'EUR'), 3).amount).toBe(999);
    expect(zero('BAM')).toEqual({ amount: 0, currency: 'BAM' });
  });
});

describe('roundHalfUp', () => {
  it('rundar symmetriskt kring noll, till skillnad från Math.round', () => {
    expect(roundHalfUp(0.5)).toBe(1);
    expect(roundHalfUp(-0.5)).toBe(-1);
    expect(Math.round(-0.5)).toBe(-0); // varför funktionen finns
    expect(roundHalfUp(-1.5)).toBe(-2);
    expect(roundHalfUp(2.4)).toBe(2);
  });

  it('gör en kreditnota till exakt spegelbilden av sin faktura', () => {
    const faktura = applyBasisPoints(money(12_345, 'SEK'), 2500);
    const kreditnota = applyBasisPoints(money(-12_345, 'SEK'), 2500);
    expect(kreditnota.amount).toBe(-faktura.amount);
  });
});

describe('applyBasisPoints', () => {
  it('tolkar 340 som 3,40 %', () => {
    expect(applyBasisPoints(money(100_000, 'SEK'), 340).amount).toBe(3400);
    expect(applyBasisPoints(money(100_000, 'SEK'), 2500).amount).toBe(25_000);
  });

  it('vägrar flyttalssatser', () => {
    expect(() => applyBasisPoints(money(100, 'SEK'), 0.034)).toThrow(/Baspunkter/);
  });
});

describe('allocate', () => {
  it('tappar aldrig en minsta enhet', () => {
    const delar = allocate(money(1000, 'SEK'), 3);
    expect(delar.map((d) => d.amount)).toEqual([334, 333, 333]);
    expect(sum(delar, 'SEK').amount).toBe(1000);
  });

  it('fungerar för negativa belopp och jämna delningar', () => {
    expect(sum(allocate(money(-1000, 'NOK'), 3), 'NOK').amount).toBe(-1000);
    expect(allocate(money(900, 'DKK'), 3).map((d) => d.amount)).toEqual([300, 300, 300]);
  });

  it('kräver ett positivt heltal delar', () => {
    expect(() => allocate(money(100, 'SEK'), 0)).toThrow(MoneyError);
    expect(() => allocate(money(100, 'SEK'), 2.5)).toThrow(MoneyError);
  });
});

describe('parseAmount', () => {
  it('läser vad en människa skriver i ett prisfält', () => {
    expect(parseAmount('1200', 'SEK').amount).toBe(120_000);
    expect(parseAmount('12,50', 'SEK').amount).toBe(1250);
    expect(parseAmount('1 200,50', 'SEK').amount).toBe(120_050);
    expect(parseAmount('1200.50', 'EUR').amount).toBe(120_050);
  });

  it('avvisar skräp i stället för att gissa', () => {
    expect(() => parseAmount('', 'SEK')).toThrow(MoneyError);
    expect(() => parseAmount('ca 1200', 'SEK')).toThrow(MoneyError);
  });
});

describe('formatMoney', () => {
  it('visar rätt valuta per marknad', () => {
    // Intl-utdata varierar mellan Node-versioner i mellanslag och symbolplacering,
    // så testet kontrollerar siffrorna och valutan — inte tecken för tecken.
    expect(formatMoney(money(120_050, 'SEK'), 'sv-SE')).toMatch(/1[\s\u00a0]?200,50/);
    expect(formatMoney(money(120_050, 'NOK'), 'nb-NO')).toMatch(/1[\s\u00a0]?200,50/);
    expect(formatMoney(money(120_050, 'DKK'), 'da-DK')).toMatch(/1[\s.\u00a0]?200,50/);
    expect(formatMoney(money(120_050, 'EUR'), 'hr-HR')).toMatch(/200,50/);
    expect(formatMoney(money(120_050, 'BAM'), 'bs-BA')).toMatch(/200,50/);
  });
});
