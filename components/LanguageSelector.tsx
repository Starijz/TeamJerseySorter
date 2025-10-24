
import React, { useContext } from 'react';
import { LocalizationContext } from '../context/LocalizationContext';
import type { Language } from '../types';

export const LanguageSelector: React.FC = () => {
  const context = useContext(LocalizationContext);

  if (!context) {
    return null;
  }

  const { language, setLanguage } = context;

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'lv', label: 'LV', flag: '🇱🇻' },
    { code: 'ru', label: 'RU', flag: '🇷🇺' },
  ];

  return (
    <div className="flex items-center bg-gray-700 rounded-full p-1">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors duration-200 ${
            language === lang.code
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-600'
          }`}
          aria-label={`Switch to ${lang.label}`}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
};
