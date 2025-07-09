import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('preferredLanguage', language);
  };
  
  const getCurrentLanguage = () => {
    return i18n.language || 'sv';
  };
  
  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    isEnglish: getCurrentLanguage() === 'en',
    isSwedish: getCurrentLanguage() === 'sv',
  };
};