import { useContext, useCallback } from 'react';
import { LocalizationContext } from '../context/LocalizationContext';
import { translations } from '../lib/translations';

export const useTranslations = () => {
  const context = useContext(LocalizationContext);

  if (context === undefined) {
    throw new Error('useTranslations must be used within a LocalizationProvider');
  }

  const { language } = context;

  return useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);
};
