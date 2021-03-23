import 'moment/locale/fr';
import 'moment/locale/sw';

import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
// @flow
import i18n from 'i18next';
import moment from 'moment';
// $FlowFixMe
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .use(Backend)
  .use(LanguageDetector)
  .init({
    // resources,
    lng: 'en',
    backend: {
      loadPath: 'https://raw.githubusercontent.com/anzioka/translations-demo/main/{{lng}}/{{ns}}.json'
    },
    fallbackLng: 'en',
    interpolation: {
      /* eslint-disable no-unused-vars */
      format(value, format, lng) {
        if (value instanceof Date) return moment(value).format(format);
        return value;
      }
      /* eslint-enable */
    },
    debug: true
  });
