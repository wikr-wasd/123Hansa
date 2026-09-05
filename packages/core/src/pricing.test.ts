import { describe, expect, it } from 'vitest';
import { calculateCommission, PricingError, verifyClientTotal } from './pricing.js';
import { money, sum } from './money.js';
import { addVat, extractVat, VatError } from './vat.js';

describe('moms', () => {
  it('lägger på och bryter ut samma belopp', () => {
    const net = money(100_000, 'SEK');
    const påslag = addVat(net, 'SE', 2500);
    expect(påslag.vat.amount).toBe(25_000);
    expect(påslag.gross.amount).toBe(125_000);

    const utbrutet = extractVat(påslag.gross, 'SE', 2500);
    expect(utbrutet.net.amount).toBe(net.amount);
    expect(utbrutet.vat.amount).toBe(påslag.vat.amount);
  });

  it('låter alltid net + vat bli exakt gross, även på udda belopp', () => {
    for (const belopp of [1, 7, 33, 101, 9999, 123_457]) {
      for (const [land, sats] of [['SE', 2500], ['BA', 1700], ['HR', 1300], ['NO', 1500]] as const) {
        const b = extractVat(money(belopp, 'SEK'), land, sats);
        expect(b.net.amount + b.vat.amount).toBe(b.gross.amount);
      }
    }
  });

  it('vägrar en momssats som inte gäller i landet', () => {
    expect(() => addVat(money(100, 'BAM'), 'BA', 2500)).toThrow(VatError);
    expect(() => addVat(money(100, 'DKK'), 'DK', 1200)).toThrow(/inte en tillåten momssats/);
    expect(() => addVat(money(100, 'BAM'), 'BA', 1700)).not.toThrow();
  });
});

describe('calculateCommission', () => {
  const bas = { country: 'SE', vatRateBasisPoints: 2500 } as const;

  it('räknar provision i baspunkter och drar av från säljarens utbetalning', () => {
    const r = calculateCommission({
      ...bas,
      salePrice: money(100_000_00, 'SEK'), // 100 000 kr
      rateBasisPoints: 340, // 3,40 %
    });
    expect(r.fee.amount).toBe(340_000); // 3 400 kr
    expect(r.breakdown.vat.amount).toBe(85_000); // 850 kr moms
    expect(r.breakdown.gross.amount).toBe(425_000);
    expect(r.sellerPayout.amount).toBe(10_000_000 - 425_000);
    expect(r.adjustedBy).toBeUndefined();
  });

  it('räknar i varje marknads egen valuta och momssats', () => {
    const bosnisk = calculateCommission({
      salePrice: money(50_000_00, 'BAM'),
      rateBasisPoints: 500,
      country: 'BA',
      vatRateBasisPoints: 1700,
    });
    expect(bosnisk.fee.currency).toBe('BAM');
    expect(bosnisk.fee.amount).toBe(250_000);
    expect(bosnisk.breakdown.vat.amount).toBe(42_500); // 17 %

    const kroatisk = calculateCommission({
      salePrice: money(50_000_00, 'EUR'),
      rateBasisPoints: 500,
      country: 'HR',
      vatRateBasisPoints: 2500,
    });
    expect(kroatisk.breakdown.vat.amount).toBe(62_500); // 25 %
  });

  it('visar när golvet eller taket slog in, i stället för att tiga', () => {
    const golv = calculateCommission({
      ...bas,
      salePrice: money(10_000, 'SEK'),
      rateBasisPoints: 340,
      minimumFee: money(50_000, 'SEK'),
    });
    expect(golv.adjustedBy).toBe('minimum');
    expect(golv.fee.amount).toBe(50_000);

    const tak = calculateCommission({
      ...bas,
      salePrice: money(100_000_000, 'SEK'),
      rateBasisPoints: 340,
      maximumFee: money(1_000_000, 'SEK'),
    });
    expect(tak.adjustedBy).toBe('maximum');
    expect(tak.fee.amount).toBe(1_000_000);
  });

  it('går alltid ihop: utbetalning + provision + moms = försäljningspriset', () => {
    for (const pris of [1_00, 999_99, 1_234_567, 99_000_000]) {
      const r = calculateCommission({ ...bas, salePrice: money(pris, 'SEK'), rateBasisPoints: 340 });
      expect(sum([r.sellerPayout, r.fee, r.breakdown.vat], 'SEK').amount).toBe(pris);
    }
  });

  it('vägrar jämföra en gräns i fel valuta', () => {
    expect(() =>
      calculateCommission({
        ...bas,
        salePrice: money(100_000, 'SEK'),
        rateBasisPoints: 340,
        minimumFee: money(500, 'NOK'),
      }),
    ).toThrow(PricingError);
  });

  it('vägrar orimliga indata', () => {
    expect(() => calculateCommission({ ...bas, salePrice: money(0, 'SEK'), rateBasisPoints: 340 })).toThrow(
      /större än noll/,
    );
    expect(() =>
      calculateCommission({ ...bas, salePrice: money(100, 'SEK'), rateBasisPoints: -1 }),
    ).toThrow(/negativ/);
    expect(() =>
      calculateCommission({
        ...bas,
        salePrice: money(100_000, 'SEK'),
        rateBasisPoints: 340,
        minimumFee: money(9000, 'SEK'),
        maximumFee: money(500, 'SEK'),
      }),
    ).toThrow(/högre än högsta/);
  });
});

describe('verifyClientTotal', () => {
  it('godkänner bara en exakt träff i samma valuta', () => {
    expect(verifyClientTotal(money(1000, 'SEK'), money(1000, 'SEK'))).toBe(true);
    expect(verifyClientTotal(money(1000, 'SEK'), money(999, 'SEK'))).toBe(false);
    expect(verifyClientTotal(money(1000, 'SEK'), money(1000, 'NOK'))).toBe(false);
  });
});
