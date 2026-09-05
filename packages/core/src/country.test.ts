import { describe, expect, it } from 'vitest';
import {
  COUNTRY_CODES, COUNTRY_INFO, CURRENCY_INFO, countriesUsingCurrency, currencyOf,
  isAllowedVatRate, isCountryCode, standardVatRate,
} from './country.js';
import { LOCALES } from './locale.js';

describe('COUNTRY_INFO', () => {
  it('täcker exakt de fem marknaderna', () => {
    expect([...COUNTRY_CODES].sort()).toEqual(['BA', 'DK', 'HR', 'NO', 'SE']);
  });

  it('ger varje land en valuta som finns i CURRENCY_INFO', () => {
    for (const c of COUNTRY_CODES) {
      expect(CURRENCY_INFO[currencyOf(c)]).toBeDefined();
    }
  });

  it('ger varje land ett standardspråk vi faktiskt levererar', () => {
    for (const c of COUNTRY_CODES) {
      expect(LOCALES).toContain(COUNTRY_INFO[c].defaultLocale);
    }
  });

  it('ger varje land en giltig IANA-tidszon', () => {
    for (const c of COUNTRY_CODES) {
      expect(() =>
        new Intl.DateTimeFormat('sv-SE', { timeZone: COUNTRY_INFO[c].timeZone }),
      ).not.toThrow();
    }
  });

  it('anger momssatser i baspunkter, standardsatsen först', () => {
    for (const c of COUNTRY_CODES) {
      const rates = COUNTRY_INFO[c].vatRates;
      expect(rates.length).toBeGreaterThan(0);
      expect(rates[0]).toBe(Math.max(...rates));
      for (const r of rates) expect(Number.isInteger(r)).toBe(true);
    }
  });
});

describe('moms per land', () => {
  it('har rätt standardsats', () => {
    expect(standardVatRate('SE')).toBe(2500);
    expect(standardVatRate('NO')).toBe(2500);
    expect(standardVatRate('DK')).toBe(2500);
    expect(standardVatRate('HR')).toBe(2500);
    expect(standardVatRate('BA')).toBe(1700);
  });

  it('Bosnien och Danmark har EN enda sats — det är avsiktligt', () => {
    expect(COUNTRY_INFO.BA.vatRates).toHaveLength(1);
    expect(COUNTRY_INFO.DK.vatRates).toHaveLength(1);
    expect(isAllowedVatRate('BA', 1300)).toBe(false);
    expect(isAllowedVatRate('DK', 1200)).toBe(false);
  });

  it('avvisar en sats som hör till ett annat land', () => {
    expect(isAllowedVatRate('SE', 1200)).toBe(true);
    expect(isAllowedVatRate('NO', 1200)).toBe(true);
    expect(isAllowedVatRate('HR', 1200)).toBe(false); // Kroatien har 13, inte 12
    expect(isAllowedVatRate('SE', 1500)).toBe(false); // 15 är norskt
  });
});

describe('valuta', () => {
  it('ger rätt valuta per marknad', () => {
    expect(currencyOf('SE')).toBe('SEK');
    expect(currencyOf('NO')).toBe('NOK');
    expect(currencyOf('DK')).toBe('DKK');
    expect(currencyOf('HR')).toBe('EUR');
    expect(currencyOf('BA')).toBe('BAM');
  });

  it('vet vilka länder som delar valuta', () => {
    expect(countriesUsingCurrency('EUR')).toEqual(['HR']);
    expect(countriesUsingCurrency('SEK')).toEqual(['SE']);
  });
});

describe('EU-tillhörighet styr momsen vid gränsöverskridande fakturering', () => {
  it('Norge och Bosnien står utanför', () => {
    expect(COUNTRY_INFO.NO.inEu).toBe(false);
    expect(COUNTRY_INFO.BA.inEu).toBe(false);
    expect(COUNTRY_INFO.SE.inEu).toBe(true);
    expect(COUNTRY_INFO.DK.inEu).toBe(true);
    expect(COUNTRY_INFO.HR.inEu).toBe(true);
  });
});

describe('isCountryCode', () => {
  it('släpper bara igenom de fem', () => {
    expect(isCountryCode('SE')).toBe(true);
    expect(isCountryCode('RS')).toBe(false); // Serbien är Burps marknad, inte Hansas
    expect(isCountryCode('se')).toBe(false);
    expect(isCountryCode(null)).toBe(false);
  });
});
