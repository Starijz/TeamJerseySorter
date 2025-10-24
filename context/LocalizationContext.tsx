
import React, { createContext, useState, useMemo, ReactNode } from 'react';
import type { Language } from '../types';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
  }), [language]);

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};
