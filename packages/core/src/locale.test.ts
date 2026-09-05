import { describe, expect, it } from 'vitest';
import {
  alternateTags, DEFAULT_LOCALE, defaultLocaleForCountry, intlLocaleFor,
  isLocale, LOCALE_INFO, LOCALES, negotiateLocale,
} from './locale.js';
import { COUNTRY_CODES } from './country.js';

describe('språkuppsättningen', () => {
  it('är fem språk för fem länder — men inte ett per land', () => {
    expect([...LOCALES].sort()).toEqual(['bs', 'da', 'en', 'no', 'sv']);
  });

  it('ger varje språk ett namn på sitt eget språk', () => {
    for (const l of LOCALES) {
      expect(LOCALE_INFO[l].nativeName.length).toBeGreaterThan(0);
    }
  });

  it('låter bs täcka både Bosnien och Kroatien', () => {
    expect(defaultLocaleForCountry('BA')).toBe('bs');
    expect(defaultLocaleForCountry('HR')).toBe('bs');
  });

  it('ger varje land ett standardspråk', () => {
    expect(defaultLocaleForCountry('SE')).toBe('sv');
    expect(defaultLocaleForCountry('NO')).toBe('no');
    expect(defaultLocaleForCountry('DK')).toBe('da');
  });
});

describe('hreflang', () => {
  it('märker bs-sidan för bs, hr OCH sr-Latn', () => {
    expect(alternateTags('bs')).toEqual(['bs', 'hr', 'sr-Latn']);
  });

  it('märker serbiskan sr-Latn — ett omärkt sr lovar kyrilliska', () => {
    expect(alternateTags('bs')).not.toContain('sr');
  });

  it('märker norskan för både bokmål och nynorsk', () => {
    expect(alternateTags('no')).toEqual(['no', 'nb', 'nn']);
  });
});

describe('negotiateLocale', () => {
  it('landar en kroatisk telefon på bs utan att /hr/ finns', () => {
    expect(negotiateLocale('hr-HR,hr;q=0.9,en;q=0.8')).toBe('bs');
  });

  it('landar serbisk latinsk skrift på bs', () => {
    expect(negotiateLocale('sr-Latn-RS,sr;q=0.9')).toBe('bs');
  });

  it('läser norska varianter som no', () => {
    expect(negotiateLocale('nb-NO,nb;q=0.9')).toBe('no');
    expect(negotiateLocale('nn-NO')).toBe('no');
  });

  it('respekterar q-värden i stället för ordningen', () => {
    expect(negotiateLocale('de;q=0.2,da;q=0.9')).toBe('da');
    expect(negotiateLocale('en;q=0.4,sv;q=0.8')).toBe('sv');
  });

  it('hoppar över språk vi inte levererar', () => {
    expect(negotiateLocale('de-DE,de;q=0.9,en;q=0.5')).toBe('en');
  });

  it('faller tillbaka när headern saknas eller är obrukbar', () => {
    expect(negotiateLocale(null)).toBe(DEFAULT_LOCALE);
    expect(negotiateLocale('')).toBe(DEFAULT_LOCALE);
    expect(negotiateLocale('de-DE')).toBe(DEFAULT_LOCALE);
    expect(negotiateLocale('de-DE', 'bs')).toBe('bs');
  });

  it('struntar i språk med q=0', () => {
    expect(negotiateLocale('da;q=0,sv;q=0.5')).toBe('sv');
  });
});

describe('intlLocaleFor', () => {
  it('formaterar efter LANDET, inte efter läsarens språk', () => {
    // En svensk som läser sidan på engelska ska ändå se en kroatisk annons
    // formaterad som kroatisk, eftersom priset är i euro.
    expect(intlLocaleFor('HR')).toBe('hr-HR');
    expect(intlLocaleFor('BA')).toBe('bs-BA');
    expect(intlLocaleFor('SE')).toBe('sv-SE');
    expect(intlLocaleFor('NO')).toBe('nb-NO');
    expect(intlLocaleFor('DK')).toBe('da-DK');
  });

  it('ger varje land en tagg Intl förstår', () => {
    for (const c of COUNTRY_CODES) {
      expect(() => new Intl.NumberFormat(intlLocaleFor(c))).not.toThrow();
    }
  });
});

describe('isLocale', () => {
  it('släpper bara igenom språk vi levererar', () => {
    expect(isLocale('bs')).toBe(true);
    expect(isLocale('hr')).toBe(false); // alias, aldrig en adress
    expect(isLocale('nb')).toBe(false);
  });
});
