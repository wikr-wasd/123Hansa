import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

interface LanguageSwitcherProps {
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
  variant?: 'header' | 'footer';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage = 'sv',
  onLanguageChange,
  variant = 'header'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLanguageSelect = (langCode: string) => {
    onLanguageChange?.(langCode);
    setIsOpen(false);
    
    // Store language preference in localStorage
    localStorage.setItem('preferredLanguage', langCode);
    
    // You would implement actual language switching logic here
    // For now, we'll just show a toast message
    import('react-hot-toast').then(({ toast }) => {
      const newLang = languages.find(l => l.code === langCode);
      toast.success(`Språk ändrat till ${newLang?.name}`);
    });
  };

  const buttonClasses = variant === 'header' 
    ? "flex items-center gap-2 px-3 py-2 text-sm font-medium text-nordic-gray-700 hover:text-nordic-blue-600 rounded-lg transition-colors"
    : "flex items-center gap-2 text-sm text-nordic-gray-300 hover:text-white transition-colors";

  const dropdownClasses = variant === 'header'
    ? "absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
    : "absolute bottom-full right-0 mb-2 w-48 bg-nordic-gray-800 rounded-lg shadow-lg border border-nordic-gray-600 py-1 z-50";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4" />
        <span className="flex items-center gap-1">
          <span>{currentLang.flag}</span>
          <span>{currentLang.name}</span>
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown */}
          <div className={dropdownClasses}>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                  language.code === currentLanguage
                    ? variant === 'header' 
                      ? 'bg-nordic-blue-50 text-nordic-blue-600' 
                      : 'bg-nordic-gray-700 text-white'
                    : variant === 'header'
                      ? 'text-nordic-gray-700 hover:bg-gray-50'
                      : 'text-nordic-gray-300 hover:bg-nordic-gray-700 hover:text-white'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
                {language.code === currentLanguage && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};