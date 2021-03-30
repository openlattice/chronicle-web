import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// NOTE: this is temporary
import translations from './core/i18n/translations';

i18n
  .use(initReactI18next)
  .use(Backend)
  .use(LanguageDetector)
  .init({
    lng: 'en',
    backend: {
      // loadPath: 'static/i18n/{{lng}}/{{ns}}.json'
      loadPath: (language) => translations[language]
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development'
  });
