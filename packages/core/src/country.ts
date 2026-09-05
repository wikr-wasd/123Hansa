/**
 * Landet avgör, inte koden.
 *
 * Land är en egenskap hos annonsen och hos användaren — aldrig något en
 * komponent antar. Valuta, momssatser, organisationsnummerformat, tidszon och
 * standardspråk följer av landet och bara av landet.
 *
 * Skriv ALDRIG "SEK" eller "Sverige" i en komponent. Läs landets uppgifter här.
 */

/** ISO 3166-1 alpha-2. De fem marknader 123Hansa är byggt för. */
export type CountryCode = 'SE' | 'NO' | 'DK' | 'HR' | 'BA';

/** ISO 4217. */
export type CurrencyCode = 'SEK' | 'NOK' | 'DKK' | 'EUR' | 'BAM';

export const COUNTRY_CODES = ['SE', 'NO', 'DK', 'HR', 'BA'] as const satisfies readonly CountryCode[];

export interface CurrencyInfo {
  readonly code: CurrencyCode;
  /** Antal decimaler valutan har. Styr formatMoney och parseAmount. */
  readonly decimalDigits: number;
  /** Namnet på minsta enheten — det som lagras i databasen. */
  readonly minorUnit: string;
}

/**
 * Typad som Record och inte med `as const` — med flit.
 *
 * Med `as const` blir decimalDigits den literala typen 2, och TypeScript avvisar
 * `decimalDigits === 0` som en omöjlig jämförelse. Just den jämförelsen är hela
 * skyddet mot en nolldecimalsvaluta, och kompilatorn ska inte optimera bort ett
 * skydd som finns för att en framtida marknad ska fungera.
 */
export const CURRENCY_INFO: Readonly<Record<CurrencyCode, CurrencyInfo>> = {
  SEK: { code: 'SEK', decimalDigits: 2, minorUnit: 'öre' },
  NOK: { code: 'NOK', decimalDigits: 2, minorUnit: 'øre' },
  DKK: { code: 'DKK', decimalDigits: 2, minorUnit: 'øre' },
  EUR: { code: 'EUR', decimalDigits: 2, minorUnit: 'cent' },
  BAM: { code: 'BAM', decimalDigits: 2, minorUnit: 'fening' },
};

export interface CountryInfo {
  readonly code: CountryCode;
  readonly currency: CurrencyCode;
  /**
   * Tillåtna momssatser i baspunkter. Första posten är standardsatsen.
   *
   * Bosnien har EN enda sats — 17 % gäller både reducerat och standard. Det är
   * avsiktligt och inte en lucka i tabellen. Danmark har likaså bara 25 %.
   */
  readonly vatRates: readonly number[];
  /** IANA-tidszon. Används för öppettider, deadlines och rapportperioder. */
  readonly timeZone: string;
  /** Vad organisationsnumret heter på plats — visas i formulär. */
  readonly orgNumberLabel: string;
  /** Standardspråk när användaren inte valt något. */
  readonly defaultLocale: LocaleCode;
  /** BCP 47-tagg för Intl: datum, tal och valuta. */
  readonly intlLocale: string;
  /** E.164-landsnummer, för telefonvalidering och visning. */
  readonly phonePrefix: string;
  /** Är landet med i EU? Styr moms vid gränsöverskridande fakturering. */
  readonly inEu: boolean;
}

/** Språkkoder 123Hansa levererar gränssnitt på. */
export type LocaleCode = 'sv' | 'no' | 'da' | 'bs' | 'en';

/**
 * Typad som Record och inte med `as const` — av samma skäl som CURRENCY_INFO:
 * vatRates ska vara readonly number[], så att isAllowedVatRate() kan fråga om
 * en godtycklig sats. Med literala tupeltyper blir includes() omöjlig att
 * anropa med ett vanligt tal.
 */
export const COUNTRY_INFO: Readonly<Record<CountryCode, CountryInfo>> = {
  SE: {
    code: 'SE',
    currency: 'SEK',
    vatRates: [2500, 1200, 600],
    timeZone: 'Europe/Stockholm',
    orgNumberLabel: 'Organisationsnummer',
    defaultLocale: 'sv',
    intlLocale: 'sv-SE',
    phonePrefix: '+46',
    inEu: true,
  },
  NO: {
    code: 'NO',
    currency: 'NOK',
    vatRates: [2500, 1500, 1200],
    timeZone: 'Europe/Oslo',
    orgNumberLabel: 'Organisasjonsnummer',
    defaultLocale: 'no',
    intlLocale: 'nb-NO',
    phonePrefix: '+47',
    inEu: false,
  },
  DK: {
    code: 'DK',
    currency: 'DKK',
    vatRates: [2500],
    timeZone: 'Europe/Copenhagen',
    orgNumberLabel: 'CVR-nummer',
    defaultLocale: 'da',
    intlLocale: 'da-DK',
    phonePrefix: '+45',
    inEu: true,
  },
  HR: {
    code: 'HR',
    currency: 'EUR',
    vatRates: [2500, 1300, 500],
    timeZone: 'Europe/Zagreb',
    orgNumberLabel: 'OIB',
    defaultLocale: 'bs',
    intlLocale: 'hr-HR',
    phonePrefix: '+385',
    inEu: true,
  },
  BA: {
    code: 'BA',
    currency: 'BAM',
    vatRates: [1700],
    timeZone: 'Europe/Sarajevo',
    orgNumberLabel: 'JIB',
    defaultLocale: 'bs',
    intlLocale: 'bs-BA',
    phonePrefix: '+387',
    inEu: false,
  },
};

export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === 'string' && (COUNTRY_CODES as readonly string[]).includes(value);
}

export function countryInfo(code: CountryCode): CountryInfo {
  return COUNTRY_INFO[code];
}

export function currencyOf(code: CountryCode): CurrencyCode {
  return COUNTRY_INFO[code].currency;
}

/** Standardmomssatsen i baspunkter. */
export function standardVatRate(code: CountryCode): number {
  return COUNTRY_INFO[code].vatRates[0]!;
}

export function isAllowedVatRate(code: CountryCode, basisPoints: number): boolean {
  return COUNTRY_INFO[code].vatRates.includes(basisPoints);
}

/**
 * Länder som delar valuta får jämföras i samma vy. I dag är det bara Kroatien
 * som har euro; funktionen finns för att kravet ska vara läsbart i koden
 * i stället för att stå som ett antagande i en komponent.
 */
export function countriesUsingCurrency(currency: CurrencyCode): CountryCode[] {
  return COUNTRY_CODES.filter((c) => COUNTRY_INFO[c].currency === currency);
}
