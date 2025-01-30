import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
import enCommon from './locales/en/common.json';
import enProperties from './locales/en/properties.json';
import enDashboard from './locales/en/dashboard.json';
import enAuth from './locales/en/auth.json';

// Spanish translations
import esTranslations from './locales/es.json';
// French translations
import frTranslations from './locales/fr.json';
// Romanian translations
import roTranslations from './locales/ro.json';

const resources = {
  en: {
    common: enCommon,
    properties: enProperties,
    dashboard: enDashboard,
    auth: enAuth
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
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    returnObjects: true,
    debug: process.env.NODE_ENV === 'development',
    react: {
      useSuspense: false
    },
    // Add namespaces configuration
    ns: ['common', 'properties', 'dashboard', 'auth'],
    defaultNS: 'common'
  })
  .then(() => {
    console.log('i18n initialized successfully');
  })
  .catch((error) => {
    console.error('Error initializing i18n:', error);
  });

export default i18n;