import { describe, expect, it } from 'vitest';
import {
  formatOrgNumber, hasChecksum, validateOrgNumber,
} from './orgnumber.js';
import { COUNTRY_CODES } from './country.js';

/**
 * Numren nedan är verkliga, publika organisationsnummer för kända bolag.
 * De är med för att bevisa att algoritmerna är RÄTT och inte bara
 * självkonsistenta: ett påhittat nummer som passerar min egen kontrollsiffra
 * bevisar ingenting.
 */
describe('validateOrgNumber — verkliga bolag ska godkännas', () => {
  it.each([
    ['SE', '556012-5790', 'Volvo AB'],
    ['SE', '5567037485', 'Spotify AB'],
    ['SE', '202100-5489', 'Bolagsverket'],
    ['SE', '5560160680', 'Ericsson'],
    ['NO', '923 609 016', 'Equinor ASA'],
    ['NO', '984851006', 'DNB Bank ASA'],
    ['NO', '982463718', 'Telenor ASA'],
    ['DK', '24256790', 'Novo Nordisk'],
    ['DK', '22756214', 'A.P. Møller-Mærsk'],
    ['DK', '61056416', 'Carlsberg'],
    ['HR', '27759560625', 'INA d.d.'],
    ['HR', '28921978587', 'HEP d.d.'],
    ['HR', '18928523252', 'Podravka'],
  ] as const)('%s %s (%s)', (country, input, _bolag) => {
    expect(validateOrgNumber(input, country).valid).toBe(true);
  });
});

describe('validateOrgNumber — fel kontrollsiffra ska falla', () => {
  it.each([
    ['SE', '5560125791'],
    ['NO', '923609017'],
    ['DK', '24256791'],
    ['HR', '27759560626'],
  ] as const)('%s %s', (country, input) => {
    const result = validateOrgNumber(input, country);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/Kontrollsiffran/);
  });
});

describe('validateOrgNumber — fel längd ska falla med begripligt skäl', () => {
  it.each([
    ['SE', '556012579', /10 siffror/],
    ['NO', '92360901', /9 siffror/],
    ['DK', '2425679', /8 siffror/],
    ['HR', '2775956062', /11 siffror/],
    ['BA', '420000000000', /13 siffror/],
  ] as const)('%s %s', (country, input, pattern) => {
    const result = validateOrgNumber(input, country);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(pattern);
  });
});

describe('normalisering', () => {
  it('struntar i bindestreck, mellanslag och landsprefix', () => {
    for (const input of ['556012-5790', '556012 5790', 'SE5560125790', ' 5560125790 ']) {
      const result = validateOrgNumber(input, 'SE');
      expect(result.valid).toBe(true);
      expect(result.normalized).toBe('5560125790');
    }
  });
});

describe('svenska särfall', () => {
  it('accepterar tolvsiffrig form med sekelprefix', () => {
    expect(validateOrgNumber('165560125790', 'SE').valid).toBe(true);
  });

  it('avvisar personnummer — en enskild firma ska inte publiceras med ägarens personnummer', () => {
    // Tredje siffran under 2 betyder fysisk person, inte juridisk.
    const result = validateOrgNumber('8112189876', 'SE');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/personnummer/);
  });
});

describe('norska och danska särfall', () => {
  it('norska nummer börjar på 8 eller 9', () => {
    expect(validateOrgNumber('723609016', 'NO').reason).toMatch(/8 eller 9/);
  });

  it('CVR-nummer börjar aldrig med 0', () => {
    expect(validateOrgNumber('04256790', 'DK').reason).toMatch(/börjar aldrig med 0/);
  });
});

describe('bosniskt JIB', () => {
  it('godkänner 13 siffror — formatkontroll är allt vi har', () => {
    expect(validateOrgNumber('4200000000001', 'BA').valid).toBe(true);
  });

  it('är det enda landet utan kontrollsiffra, och det ska gå att fråga om', () => {
    expect(hasChecksum('BA')).toBe(false);
    for (const c of COUNTRY_CODES.filter((c) => c !== 'BA')) {
      expect(hasChecksum(c)).toBe(true);
    }
  });
});

describe('formatOrgNumber', () => {
  it('skriver numret som det skrivs i landet', () => {
    expect(formatOrgNumber('5560125790', 'SE')).toBe('556012-5790');
    expect(formatOrgNumber('923609016', 'NO')).toBe('923 609 016');
    expect(formatOrgNumber('24256790', 'DK')).toBe('24256790');
  });

  it('formaterar aldrig ett ogiltigt nummer — då visas det användaren skrev', () => {
    expect(formatOrgNumber('inte ett nummer', 'SE')).toBe('inte ett nummer');
  });
});
