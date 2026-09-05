/**
 * Organisationsnummer för de fem marknaderna.
 *
 * Ett fel organisationsnummer i en företagsannons är inte ett kosmetiskt fel:
 * det är den enda uppgift en köpare kan slå upp i ett offentligt register för
 * att se att säljaren äger det hen säljer. Fyra av fem länder har en
 * kontrollsiffra — den kontrolleras här, inte i ett formulär.
 *
 * Validering av FORMAT är inte detsamma som att företaget FINNS. Uppslag mot
 * Bolagsverket, Brønnøysund, CVR, Sudski registar och APIF hör hemma i API:t.
 * Se docs/OPEN-QUESTIONS.md.
 */

import type { CountryCode } from './country.js';

export interface OrgNumberResult {
  readonly valid: boolean;
  /** Endast siffror, utan bindestreck och mellanslag. Satt även när valid=false. */
  readonly normalized: string;
  /** Varför numret underkändes. Undefined när valid=true. */
  readonly reason?: string;
}

const ok = (normalized: string): OrgNumberResult => ({ valid: true, normalized });
const fail = (normalized: string, reason: string): OrgNumberResult => ({
  valid: false,
  normalized,
  reason,
});

/** Plockar bort bindestreck, mellanslag, punkter och ledande landsprefix. */
function normalize(input: string): string {
  return input.trim().replace(/^(SE|NO|DK|HR|BA)/i, '').replace(/[^0-9]/g, '');
}

function digits(value: string): number[] {
  return [...value].map((c) => c.charCodeAt(0) - 48);
}

/** Luhn (mod 10). Svenska organisationsnummer. */
function luhnValid(value: string): boolean {
  const d = digits(value);
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    const fromRight = d.length - 1 - i;
    let n = d[i]!;
    if (fromRight % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

/**
 * Mod 11 med givna vikter. Används av Norge och Danmark.
 * Restsiffra 10 finns inte — numret kan då aldrig vara giltigt.
 */
function mod11Valid(value: string, weights: readonly number[]): boolean {
  const d = digits(value);
  if (d.length !== weights.length + 1) return false;
  let sum = 0;
  for (let i = 0; i < weights.length; i++) sum += d[i]! * weights[i]!;
  const remainder = sum % 11;
  if (remainder === 1) return false; // skulle kräva kontrollsiffra 10
  const check = remainder === 0 ? 0 : 11 - remainder;
  return check === d[weights.length];
}

/** ISO 7064 MOD 11,10. Kroatiska OIB. */
function oibValid(value: string): boolean {
  const d = digits(value);
  let a = 10;
  for (let i = 0; i < 10; i++) {
    a = (a + d[i]!) % 10;
    if (a === 0) a = 10;
    a = (a * 2) % 11;
  }
  const check = a === 1 ? 0 : 11 - a;
  return check === d[10];
}

/**
 * Svenskt organisationsnummer: 10 siffror med Luhn-kontrollsiffra.
 *
 * Tolvsiffriga varianter med sekelprefix (16xxxxxxxxxx) accepteras och kortas.
 * Tredje siffran är minst 2 för juridiska personer — ett tiosiffrigt nummer med
 * lägre tredje siffra är ett personnummer, och en enskild firma som säljs ska
 * inte identifieras med ägarens personnummer i en publik annons.
 */
export function validateSeOrgNumber(input: string): OrgNumberResult {
  let n = normalize(input);
  if (n.length === 12 && n.startsWith('16')) n = n.slice(2);
  if (n.length !== 10) return fail(n, 'Svenskt organisationsnummer ska ha 10 siffror');
  if (Number(n[2]) < 2) {
    return fail(n, 'Tredje siffran är lägre än 2 — det ser ut som ett personnummer, inte ett organisationsnummer');
  }
  return luhnValid(n) ? ok(n) : fail(n, 'Kontrollsiffran stämmer inte');
}

/** Norskt organisasjonsnummer: 9 siffror, mod 11 med vikterna 3,2,7,6,5,4,3,2. */
export function validateNoOrgNumber(input: string): OrgNumberResult {
  const n = normalize(input);
  if (n.length !== 9) return fail(n, 'Norskt organisasjonsnummer ska ha 9 siffror');
  if (!/^[89]/.test(n)) {
    return fail(n, 'Norska organisasjonsnummer börjar på 8 eller 9');
  }
  return mod11Valid(n, [3, 2, 7, 6, 5, 4, 3, 2]) ? ok(n) : fail(n, 'Kontrollsiffran stämmer inte');
}

/** Danskt CVR-nummer: 8 siffror, mod 11 med vikterna 2,7,6,5,4,3,2. */
export function validateDkOrgNumber(input: string): OrgNumberResult {
  const n = normalize(input);
  if (n.length !== 8) return fail(n, 'Danskt CVR-nummer ska ha 8 siffror');
  if (n[0] === '0') return fail(n, 'CVR-nummer börjar aldrig med 0');
  return mod11Valid(n, [2, 7, 6, 5, 4, 3, 2]) ? ok(n) : fail(n, 'Kontrollsiffran stämmer inte');
}

/** Kroatiskt OIB: 11 siffror, ISO 7064 MOD 11,10. */
export function validateHrOrgNumber(input: string): OrgNumberResult {
  const n = normalize(input);
  if (n.length !== 11) return fail(n, 'Kroatiskt OIB ska ha 11 siffror');
  return oibValid(n) ? ok(n) : fail(n, 'Kontrollsiffran stämmer inte');
}

/**
 * Bosniskt JIB: 13 siffror.
 *
 * ⚠️ ENDAST FORMATKONTROLL. Någon offentligt publicerad kontrollsiffra för JIB
 * har inte kunnat bekräftas, och att gissa en algoritm är värre än att avstå:
 * ett felaktigt avvisat nummer stänger ute en riktig säljare, och det syns
 * aldrig i loggarna eftersom hen bara ger upp. Bosniska annonser behöver därför
 * ett registeruppslag mot APIF/UIO för att räknas som verifierade — se
 * docs/OPEN-QUESTIONS.md, fråga 3.
 */
export function validateBaOrgNumber(input: string): OrgNumberResult {
  const n = normalize(input);
  if (n.length !== 13) return fail(n, 'Bosniskt JIB ska ha 13 siffror');
  return ok(n);
}

const VALIDATORS: Record<CountryCode, (input: string) => OrgNumberResult> = {
  SE: validateSeOrgNumber,
  NO: validateNoOrgNumber,
  DK: validateDkOrgNumber,
  HR: validateHrOrgNumber,
  BA: validateBaOrgNumber,
};

/** Validerar mot rätt lands regler. Landet kommer ur annonsen, aldrig ur numret. */
export function validateOrgNumber(input: string, country: CountryCode): OrgNumberResult {
  return VALIDATORS[country](input);
}

/**
 * Skriver numret som det skrivs i respektive land.
 * Formaterar ALDRIG ett underkänt nummer — då visas det som användaren skrev.
 */
export function formatOrgNumber(input: string, country: CountryCode): string {
  const result = validateOrgNumber(input, country);
  if (!result.valid) return input;
  const n = result.normalized;
  switch (country) {
    case 'SE':
      return `${n.slice(0, 6)}-${n.slice(6)}`;
    case 'NO':
      return `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
    case 'DK':
    case 'HR':
    case 'BA':
      return n;
  }
}

/** Om numret ger en verifierbar kontrollsiffra. Falskt för BA — se ovan. */
export function hasChecksum(country: CountryCode): boolean {
  return country !== 'BA';
}
