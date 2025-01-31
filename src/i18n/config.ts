import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
import enCommon from './locales/en/common.json';
import enProperties from './locales/en/properties.json';
import enDashboard from './locales/en/dashboard.json';
import enAuth from './locales/en/auth.json';

// Spanish translations
import esCommon from './locales/es/common.json';
import esProperties from './locales/es/properties.json';
import esDashboard from './locales/es/dashboard.json';

// French translations
import frCommon from './locales/fr/common.json';
import frProperties from './locales/fr/properties.json';
import frDashboard from './locales/fr/dashboard.json';

// Romanian translations
import roCommon from './locales/ro/common.json';
import roProperties from './locales/ro/properties.json';
import roDashboard from './locales/ro/dashboard.json';

const resources = {
  en: {
    common: enCommon,
    properties: enProperties,
    dashboard: enDashboard,
    auth: enAuth,
  },
  es: {
    common: esCommon,
    properties: esProperties,
    dashboard: esDashboard,
  },
  fr: {
    common: frCommon,
    properties: frProperties,
    dashboard: frDashboard,
  },
  ro: {
    common: roCommon,
    properties: roProperties,
    dashboard: roDashboard,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    defaultNS: 'common',
    ns: ['common', 'properties', 'dashboard', 'auth'],
    debug: process.env.NODE_ENV === 'development', // enable debug in development
    react: {
      useSuspense: false, // recommended for better performance
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;