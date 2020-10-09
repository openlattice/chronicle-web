// @flow

import { PROPERTY_CONSTS } from './SchemaConstants';

const {
  ACTIVITY_END_TIME,
  ACTIVITY_NAME,
  ACTIVITY_START_TIME,
  ADULT_MEDIA,
  ADULT_MEDIA_PROPORTION,
  ADULT_MEDIA_PURPOSE,
  BG_AUDIO,
  BG_AUDIO_TYPE,
  BG_MEDIA_PROPORTION,
  BG_TV,
  BG_TV_AGE,
  BOOK_TITLE,
  BOOK_TYPE,
  CAREGIVER,
  DAY_OF_WEEK,
  DEVICE,
  LOCATION,
  MEDIA_ACTIVITY,
  MEDIA_AGE,
  MEDIA_NAME,
  NON_TYPICAL_DAY_REASON,
  NON_TYPICAL_SLEEP_PATTERN,
  OTHER_ACTIVITY,
  SECONDARY_ACTIVITY,
  SLEEP_ARRANGEMENT,
  SLEEP_PATTERN,
  TYPICAL_DAY_FLAG,
  WAKE_UP_COUNT,
} = PROPERTY_CONSTS;

const PAGE_NUMBERS = {
  DAY_SPAN_PAGE: 1,
  FIRST_ACTIVITY_PAGE: 2,
  PRE_SURVEY_PAGE: 0,
};

// map from react json form schema properties to easily understandable titles
// the mapped values will appear as ol.title values in the entity data
const QUESTION_TITLE_LOOKUP = {
  [ACTIVITY_END_TIME]: 'Activity end time',
  [ACTIVITY_NAME]: 'Primary activity',
  [ACTIVITY_START_TIME]: 'Activity start time',
  [ADULT_MEDIA]: 'Adult media use',
  [ADULT_MEDIA_PROPORTION]: 'Adult media proportion',
  [ADULT_MEDIA_PURPOSE]: 'Purpose of adult media',
  [MEDIA_AGE]: 'Media age',
  [BG_AUDIO]: 'Background audio',
  [BG_AUDIO_TYPE]: 'Background audio type',
  [BG_MEDIA_PROPORTION]: 'Background media proportion',
  [BG_TV]: 'Background TV',
  [BG_TV_AGE]: 'Background TV age',
  [BOOK_TITLE]: 'Book title',
  [BOOK_TYPE]: 'Book type',
  [CAREGIVER]: 'Caregiver',
  [DAY_OF_WEEK]: 'Day of week',
  [DEVICE]: 'Device',
  [LOCATION]: 'Location',
  [MEDIA_ACTIVITY]: 'Media activity',
  [MEDIA_AGE]: 'Media age',
  [MEDIA_NAME]: 'Media name',
  [NON_TYPICAL_DAY_REASON]: 'Non typical day reason',
  [NON_TYPICAL_SLEEP_PATTERN]: 'Non typical sleep reason',
  [OTHER_ACTIVITY]: 'Other activity',
  [SECONDARY_ACTIVITY]: 'Secondary activity',
  [SLEEP_ARRANGEMENT]: 'Sleep arrangement',
  [SLEEP_PATTERN]: 'Sleep pattern',
  [TYPICAL_DAY_FLAG]: 'Typical day',
  [WAKE_UP_COUNT]: 'Wake up at night'
};
/* eslint-disable import/prefer-default-export */
export {
  PAGE_NUMBERS,
  QUESTION_TITLE_LOOKUP
};
/* eslint-enable */
