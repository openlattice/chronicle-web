// @flow

import isPlainObject from 'lodash/isPlainObject';
import set from 'lodash/set';
import { getIn } from 'immutable';

import JSONKEY_ID_LOOKUP from '../constants/JsonKeyAnswerIdMapping';
import TranslationKeys from '../constants/TranslationKeys';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

const {
  ACTIVITY_NAME,
  ADULT_MEDIA,
  BG_AUDIO_DAY,
  BG_AUDIO_NIGHT,
  BG_TV_DAY,
  BG_TV_NIGHT,
  CAREGIVER,
  NON_TYPICAL_SLEEP_PATTERN,
  PRIMARY_BOOK_TYPE,
  PRIMARY_MEDIA_ACTIVITY,
  PRIMARY_MEDIA_AGE,
  SECONDARY_ACTIVITY,
  SECONDARY_BOOK_TYPE,
  SECONDARY_MEDIA_ACTIVITY,
  SECONDARY_MEDIA_AGE,
  SLEEP_ARRANGEMENT,
  SLEEP_PATTERN,
  TYPICAL_DAY_FLAG,
} = PROPERTY_CONSTS;

// create object { ol.id -> value -> english }
const createEnglishTranslationLookup = (translationData :Object, language :string) => {
  const result = {};

  const english :Object = translationData.en.translation;
  const srcLanguage :Object = translationData[language].translation;

  Object.entries(srcLanguage).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((val, index) => {
        const translation = getIn(english, [key, index], val);
        // $FlowFixMe
        set(result, [JSONKEY_ID_LOOKUP[key], val], translation);
      });
    }

    if (isPlainObject(value)) {
      // $FlowFixMe
      Object.entries(value).forEach(([subKey, val]) => {
        const translation = getIn(english, [key, subKey], val);
        // $FlowFixMe
        set(result, [JSONKEY_ID_LOOKUP[key], val], translation);
      });
    }
  });

  const yesNoDontKnow = [TranslationKeys.YES, TranslationKeys.NO, TranslationKeys.DONT_KNOW];
  yesNoDontKnow.forEach((key) => {
    set(result, [SLEEP_PATTERN, srcLanguage[key]], english[key]);
    set(result, [TYPICAL_DAY_FLAG, srcLanguage[key]], english[key]);
  });

  // "Other" value in checkboxes / radio widgets
  const withOtherIds = [NON_TYPICAL_SLEEP_PATTERN, SLEEP_ARRANGEMENT, PRIMARY_BOOK_TYPE, PRIMARY_MEDIA_ACTIVITY];
  withOtherIds.forEach((id) => {
    set(result, [id, srcLanguage[TranslationKeys.OTHER]], english[TranslationKeys.OTHER]);
  });

  // "None" value in checkboxes
  set(result, [CAREGIVER, srcLanguage[TranslationKeys.NO_ONE]], english[TranslationKeys.NO_ONE]);

  // secondary activity
  set(result, SECONDARY_ACTIVITY, result[ACTIVITY_NAME]);

  // secondary media + book type
  set(result, SECONDARY_MEDIA_ACTIVITY, result[PRIMARY_MEDIA_ACTIVITY]);
  set(result, SECONDARY_MEDIA_AGE, result[PRIMARY_MEDIA_AGE]);
  set(result, SECONDARY_BOOK_TYPE, result[PRIMARY_BOOK_TYPE]);

  // bg media
  const bgMedia = result[BG_TV_DAY];
  set(result, BG_AUDIO_DAY, bgMedia);
  set(result, BG_TV_NIGHT, bgMedia);
  set(result, BG_AUDIO_NIGHT, bgMedia);
  set(result, ADULT_MEDIA, bgMedia);

  return result;
};

export default createEnglishTranslationLookup;
