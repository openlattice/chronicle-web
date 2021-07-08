// @flow

import Backend from 'i18next-http-backend';
import Cookies from 'js-cookie';
import LanguageDetector from 'i18next-browser-languagedetector';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translations from './translations';

import * as LanguageCodes from '../../utils/constants/LanguageCodes';
import { DEFAULT_LANGUAGE_COOKIE } from '../../utils/constants/StorageConstants';

declare var __ENV_DEV__ :boolean;

const defaultLng = Cookies.get(DEFAULT_LANGUAGE_COOKIE) || LanguageCodes.ENGLISH;

i18n
  .use(initReactI18next)
  .use(Backend)
  .use(LanguageDetector)
  .init({
    lng: defaultLng,
    backend: {
      loadPath: (language) => translations[language]
    },
    fallbackLng: LanguageCodes.ENGLISH,
    debug: __ENV_DEV__
  });
