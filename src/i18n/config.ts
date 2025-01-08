import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all translations
import enCommon from './locales/en/common.json';
import enDashboard from './locales/en/dashboard.json';
import enNavigation from './locales/en/navigation.json';
import enProperties from './locales/en/properties.json';
import enSettings from './locales/en/settings.json';
import enTenants from './locales/en/tenants.json';
import enMaintenance from './locales/en/maintenance.json';

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    navigation: enNavigation,
    properties: enProperties,
    settings: enSettings,
    tenants: enTenants,
    maintenance: enMaintenance,
  },
  // Add other languages similarly
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Set default language to English
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'dashboard', 'navigation', 'properties', 'settings', 'tenants', 'maintenance'],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;