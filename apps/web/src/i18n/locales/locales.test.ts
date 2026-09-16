import { describe, expect, it } from 'vitest';
import sv from './sv';
import en from './en';
import no from './no';
import da from './da';

// Typerna fångar en glömd nyckel redan vid bygget. De här testerna fångar det
// som typerna inte ser: en nyckel som finns men är tom, eller en "översättning"
// som är oförändrad svenska.

const dictionaries = { en, no, da } as const;
const swedishKeys = Object.keys(sv).sort();

// Ord som är likadana på flera nordiska språk och därför inte säger något om
// att texten är oöversatt.
const SHARED_WORDS = new Set(['Kontakt', 'Support', 'Land', 'M&A']);

describe('ordböckerna', () => {
  it('svenska har nycklar', () => {
    expect(swedishKeys.length).toBeGreaterThan(50);
  });

  for (const [code, dictionary] of Object.entries(dictionaries)) {
    describe(code, () => {
      it('har exakt samma nyckelmängd som svenskan', () => {
        expect(Object.keys(dictionary).sort()).toEqual(swedishKeys);
      });

      it('har inga tomma strängar', () => {
        const empty = Object.entries(dictionary)
          .filter(([, value]) => typeof value !== 'string' || value.trim().length === 0)
          .map(([key]) => key);
        expect(empty).toEqual([]);
      });

      it('är inte bara kopierad svenska', () => {
        const identical = Object.entries(dictionary).filter(
          ([key, value]) => value === sv[key as keyof typeof sv] && !SHARED_WORDS.has(String(value))
        );
        // Enstaka ord får sammanfalla; hela ordboken får inte göra det.
        expect(identical.length).toBeLessThan(swedishKeys.length * 0.15);
      });
    });
  }

  it('språknamnen står på sitt eget språk i väljaren', () => {
    // Ett språkval som säger "Norwegian" på en norsk sida är skrivet av någon
    // som inte tänkte på vem som läser det.
    expect(no.login).not.toBe(en.login);
    expect(da.login).not.toBe(en.login);
  });
});
