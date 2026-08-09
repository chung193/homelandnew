import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import viCommon from './locales/vi/common.json';
import enDashboard from './locales/en/dashboard.json';
import viDashboard from './locales/vi/dashboard.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { common: enCommon, dashboard: enDashboard },
            vi: { common: viCommon, dashboard: viDashboard }
        },
        lng: localStorage.getItem('lang') || 'vi',
        fallbackLng: 'en',
        interpolation: { escapeValue: false }
    });

export default i18n;
