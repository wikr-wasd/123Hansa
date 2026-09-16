import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import sv from './locales/sv';
import en from './locales/en';
import no from './locales/no';
import da from './locales/da';

// En fil per språk, med svenska som källa. Ordboken låg tidigare i den här
// filen: 450 nycklar, varav 29 användes, och `no` och `da` hade fem rader var.
// Norska och danska besökare såg alltså svenska.
//
// `bs` (bosniska och kroatiska i latinsk skrift) saknas med flit: Kroatien och
// Bosnien ligger i ett senare skede (docs/BUSINESS.md).

export const SUPPORTED_LANGUAGES = [
  { code: 'sv', label: 'Svenska' },
  { code: 'no', label: 'Norsk' },
  { code: 'da', label: 'Dansk' },
  { code: 'en', label: 'English' },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      sv: { translation: sv },
      no: { translation: no },
      da: { translation: da },
      en: { translation: en },
    },
    fallbackLng: 'sv',
    supportedLngs: SUPPORTED_LANGUAGES.map((language) => language.code),
    // "nb-NO" och "nn-NO" ska landa på no, "sv-SE" på sv.
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'preferredLanguage',
      caches: ['localStorage'],
    },
  });

export default i18n;
