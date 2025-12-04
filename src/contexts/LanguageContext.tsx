import React, { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();

  const handleSetLanguage = (newLanguage: Language) => {
    i18n.changeLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider
      value={{
        language: (i18n.language as Language) || 'th',
        setLanguage: handleSetLanguage,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};