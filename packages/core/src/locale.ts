/**
 * Språk och adresser.
 *
 * 123Hansa levererar gränssnitt på fem språk för fem länder — men INTE ett
 * språk per land. Bosniska, kroatiska och serbiska i latinsk skrift skiljer sig
 * i ordval, inte i grammatik, och tre nästan identiska ordböcker glider isär på
 * den nyckel någon glömmer i två av dem. Därför är `bs` EN ordbok som täcker
 * både Bosnien och Kroatien.
 *
 * Lärdomen kommer från systerprodukten Burp, som gjorde samma val efter att ha
 * provat alternativet.
 */

import { COUNTRY_INFO, type CountryCode, type LocaleCode } from './country.js';

export const LOCALES = ['sv', 'no', 'da', 'bs', 'en'] as const satisfies readonly LocaleCode[];

export const DEFAULT_LOCALE: LocaleCode = 'sv';

export interface LocaleInfo {
  readonly code: LocaleCode;
  /** Språkets namn på sitt eget språk — så det går att välja utan att förstå sidan. */
  readonly nativeName: string;
  /** BCP 47-taggar som ska märkas med hreflang mot den här ordboken. */
  readonly alternateTags: readonly string[];
}

export const LOCALE_INFO = {
  sv: { code: 'sv', nativeName: 'Svenska', alternateTags: ['sv'] },
  no: { code: 'no', nativeName: 'Norsk', alternateTags: ['no', 'nb', 'nn'] },
  da: { code: 'da', nativeName: 'Dansk', alternateTags: ['da'] },
  /**
   * `sr-Latn` märks ut med flit. Ett omärkt `sr` lovar kyrilliska, och den som
   * klickar får latinsk skrift utan förvarning.
   */
  bs: { code: 'bs', nativeName: 'Bosanski / Hrvatski', alternateTags: ['bs', 'hr', 'sr-Latn'] },
  en: { code: 'en', nativeName: 'English', alternateTags: ['en'] },
} as const satisfies Record<LocaleCode, LocaleInfo>;

/**
 * Alias som accepteras i Accept-Language men ALDRIG blir egna adresser.
 *
 * En kroatisk telefon landar på /bs/ utan att /hr/ finns. Att ge dem egna
 * URL:er hade gett Google samma innehåll på två adresser.
 */
const LOCALE_ALIASES: Record<string, LocaleCode> = {
  sv: 'sv', 'sv-se': 'sv', 'sv-fi': 'sv',
  no: 'no', nb: 'no', nn: 'no', 'nb-no': 'no', 'nn-no': 'no', 'no-no': 'no',
  da: 'da', 'da-dk': 'da',
  bs: 'bs', 'bs-ba': 'bs',
  hr: 'bs', 'hr-hr': 'bs', 'hr-ba': 'bs',
  sr: 'bs', 'sr-latn': 'bs', 'sr-rs': 'bs', 'sr-ba': 'bs',
  en: 'en', 'en-gb': 'en', 'en-us': 'en',
};

export function isLocale(value: unknown): value is LocaleCode {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Standardspråket för ett land, när användaren inte valt något. */
export function defaultLocaleForCountry(country: CountryCode): LocaleCode {
  return COUNTRY_INFO[country].defaultLocale;
}

/**
 * Väljer språk ur en Accept-Language-header.
 *
 * NULL i en användares språkkolumn betyder "har inte valt", inte "valde
 * svenska". Den skillnaden avgör om vi får byta språk åt någon senare.
 */
export function negotiateLocale(
  acceptLanguage: string | null | undefined,
  fallback: LocaleCode = DEFAULT_LOCALE,
): LocaleCode {
  if (!acceptLanguage) return fallback;

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      const quality = q ? Number.parseFloat(q.split('=')[1] ?? '1') : 1;
      return { tag: tag.trim().toLowerCase(), quality: Number.isFinite(quality) ? quality : 0 };
    })
    .filter((entry) => entry.tag !== '' && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    const direct = LOCALE_ALIASES[tag];
    if (direct) return direct;
    const base = LOCALE_ALIASES[tag.split('-')[0] ?? ''];
    if (base) return base;
  }
  return fallback;
}

/** Alla hreflang-taggar en sida ska märkas med, per språkversion. */
export function alternateTags(locale: LocaleCode): readonly string[] {
  return LOCALE_INFO[locale].alternateTags;
}

/**
 * BCP 47-taggen som skickas till Intl för datum, tal och valuta.
 *
 * Språk och land är två olika saker: en svensk som läser sidan på engelska ska
 * ändå se priser i SEK med svensk sifferformatering, eftersom annonsen är
 * svensk. Därför avgör LANDET formateringen och språket bara texten.
 */
export function intlLocaleFor(country: CountryCode): string {
  return COUNTRY_INFO[country].intlLocale;
}
