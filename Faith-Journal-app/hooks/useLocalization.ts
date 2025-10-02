import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { type Language } from '../types.ts';
import { translations } from '../constants.ts';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang === 'es' || savedLang === 'en') ? savedLang : 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage: handleSetLanguage,
    t
  }), [language, t]);

  // FIX: Replaced JSX with React.createElement because JSX syntax is not allowed in .ts files.
  return React.createElement(LocalizationContext.Provider, { value: value }, children);
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
