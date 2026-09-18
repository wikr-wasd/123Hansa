import { describe, expect, it } from 'vitest';
import {
  INDUSTRY_KEYS,
  LEGACY_SWEDISH_INDUSTRIES,
  industryTranslationKey,
  isIndustry,
} from './industry.js';
import { INDUSTRY_MULTIPLES } from './valuation.js';

describe('branschtaxonomin', () => {
  it('har inga dubbletter', () => {
    expect(new Set(INDUSTRY_KEYS).size).toBe(INDUSTRY_KEYS.length);
  });

  it('har nycklar som är språkneutrala', () => {
    // En nyckel med å, ä, ö eller versaler är en text som smugit sig in som
    // nyckel. Den hamnar i databasen och går sedan inte att byta.
    for (const key of INDUSTRY_KEYS) {
      expect(key).toMatch(/^[a-z_]+$/);
    }
  });

  it('har "other" sist, så att standardvalet inte blir "vet inte"', () => {
    expect(INDUSTRY_KEYS[INDUSTRY_KEYS.length - 1]).toBe('other');
  });

  it('ger varje bransch en multipel', () => {
    // Det här är invarianten som gör att en annons alltid går att värdera.
    for (const key of INDUSTRY_KEYS) {
      expect(INDUSTRY_MULTIPLES[key]).toBeDefined();
    }
    expect(Object.keys(INDUSTRY_MULTIPLES).sort()).toEqual([...INDUSTRY_KEYS].sort());
  });

  it('har multiplar där låg aldrig överstiger hög', () => {
    for (const key of INDUSTRY_KEYS) {
      const m = INDUSTRY_MULTIPLES[key];
      expect(m.ebitLow).toBeLessThanOrEqual(m.ebitHigh);
      expect(m.revenueLow).toBeLessThanOrEqual(m.revenueHigh);
      expect(m.ebitLow).toBeGreaterThan(0);
      expect(m.revenueLow).toBeGreaterThan(0);
    }
  });
});

describe('isIndustry', () => {
  it('känner igen en riktig bransch', () => {
    expect(isIndustry('software')).toBe(true);
    expect(isIndustry('other')).toBe(true);
  });

  it('avvisar allt annat', () => {
    expect(isIndustry('Bygg och anläggning')).toBe(false);
    expect(isIndustry('SOFTWARE')).toBe(false);
    expect(isIndustry('')).toBe(false);
    expect(isIndustry(null)).toBe(false);
    expect(isIndustry(undefined)).toBe(false);
    expect(isIndustry(7)).toBe(false);
  });
});

describe('industryTranslationKey', () => {
  it('bygger nyckeln ordböckerna använder', () => {
    expect(industryTranslationKey('property_services')).toBe('industry.property_services');
  });
});

describe('de gamla svenska texterna', () => {
  it('pekar alla på en bransch som finns', () => {
    for (const industry of Object.values(LEGACY_SWEDISH_INDUSTRIES)) {
      expect(isIndustry(industry)).toBe(true);
    }
  });

  it('täcker varje bransch, så att inget val försvann i bytet', () => {
    // Den gamla listan hade tretton val. Tappar den nya ett av dem betyder det
    // att en säljare inte längre kan beskriva sin verksamhet.
    expect(new Set(Object.values(LEGACY_SWEDISH_INDUSTRIES)).size).toBe(INDUSTRY_KEYS.length);
  });
});
