// @flow

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import i18n from 'i18next';

// $FlowFixMe
import { initReactI18next } from 'react-i18next';

// NOTE: this is temporary. uncomment when in dev
import translations from './translations';
import * as LanguageCodes from '../../utils/constants/LanguageCodes';

declare var __ENV_DEV__ :boolean;

i18n
  .use(initReactI18next)
  .use(Backend)
  .use(LanguageDetector)
  .init({
    lng: LanguageCodes.ENGLISH,
    backend: {
      // loadPath: 'static/i18n/{{lng}}/{{ns}}.json'
      loadPath: (language) => translations[language]
    },
    fallbackLng: LanguageCodes.ENGLISH,
    debug: __ENV_DEV__
  });
