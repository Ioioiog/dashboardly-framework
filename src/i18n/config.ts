import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all translations
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import frTranslations from './locales/fr.json';
import roTranslations from './locales/ro.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      es: {
        translation: esTranslations,
      },
      fr: {
        translation: frTranslations,
      },
      ro: {
        translation: roTranslations,
      },
    },
    lng: localStorage.getItem('language') || 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    debug: true, // Enable debug mode to see what's happening with translations
  });

// Log the loaded translations for debugging
console.log('Loaded translations:', {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  ro: roTranslations
});

export default i18n;