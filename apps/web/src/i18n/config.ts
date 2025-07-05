import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Basic translations for now
const resources = {
  sv: {
    translation: {
      welcome: 'Välkommen till 123Hansa',
      login: 'Logga in',
      register: 'Registrera',
      home: 'Hem',
      businesses: 'Företag',
    }
  },
  en: {
    translation: {
      welcome: 'Welcome to 123Hansa',
      login: 'Login',
      register: 'Register',
      home: 'Home',
      businesses: 'Businesses',
    }
  },
  no: {
    translation: {
      welcome: 'Velkommen til 123Hansa',
      login: 'Logg inn',
      register: 'Registrer',
      home: 'Hjem',
      businesses: 'Bedrifter',
    }
  },
  da: {
    translation: {
      welcome: 'Velkommen til 123Hansa',
      login: 'Log ind',
      register: 'Registrer',
      home: 'Hjem',
      businesses: 'Virksomheder',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'sv',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;