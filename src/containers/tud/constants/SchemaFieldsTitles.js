// @flow

import { PROPERTY_CONSTS } from './SchemaConstants';

const {
  ADULT_MEDIA_PURPOSE,
  BG_AUDIO_TYPE,
  BG_TV_AGE,
  BOOK_TITLE,
  BOOK_TYPE,
  DAY_END_TIME,
  DAY_OF_WEEK,
  DAY_START_TIME,
  MEDIA_ACTIVITY,
  MEDIA_AGE,
  MEDIA_NAME,
  NON_TYPICAL_DAY_REASON,
  NON_TYPICAL_SLEEP_PATTERN,
  SLEEP_ARRANGEMENT,
  SLEEP_PATTERN,
  TODAY_WAKEUP_TIME,
  TYPICAL_DAY_FLAG,
  WAKE_UP_COUNT,
} = PROPERTY_CONSTS;

const SCHEMA_FIELDS_TITLES = {
  [ADULT_MEDIA_PURPOSE]: 'What was the tablet/laptop/cell phone/smart phone used for?',
  [BG_AUDIO_TYPE]: 'What kind of audio was in the background?',
  [BG_TV_AGE]: 'Was the program for your child\'s age, for older children, '
      + 'for younger children, or for adults?',
  [BOOK_TITLE]: 'What was the title of the book(s)'
    + ' If you are unsure of exact title, either describe (e.g., a book about unicorns)'
    + ' or leave it blank',
  [BOOK_TYPE]: 'Specifically, what type(s) of book did your child read?',
  [DAY_OF_WEEK]: 'We would like you to think about your child\'s day and complete the time use diary for yesterday. '
      + 'What day of the week was yesterday?',
  [DAY_END_TIME]: 'What time did your child go to bed yesterday night?'
     + ' Please think about when your child first fell asleep for the night.'
     + ' Later in the survey, we will ask about how often your child woke up in the middle of the night.',
  [DAY_START_TIME]: 'What time did your child wake up yesterday morning?'
     + ' Please think about when your child woke up for the day, rather'
     + ' than waking up in the middle of the night and going back to sleep.',
  [MEDIA_ACTIVITY]: 'Specifically, what primary media activity was your child engaged in?',
  [MEDIA_AGE]: 'Was the media program (e.g. show, app, movie)'
    + ' for your child\'s age, for older children, for younger children, or for adults?',
  [MEDIA_NAME]: 'What was the name of the media program (e.g name of show, movie)?\n'
    + 'If you are unsure of exact name, either describe (e.g. a drawing app, a movie about unicorns) or leave it blank',
  [NON_TYPICAL_DAY_REASON]: 'What made yesterday a non-typical day?',
  [NON_TYPICAL_SLEEP_PATTERN]: 'What made your child\'s sleeping pattern non-typical?',
  [SLEEP_ARRANGEMENT]: 'Last night, what was your child\'s sleeping arrangement?',
  [SLEEP_PATTERN]: 'Last night, was your child\'s sleep pattern typical?',
  [TODAY_WAKEUP_TIME]: 'What time did your child wake up this morning?',
  [TYPICAL_DAY_FLAG]: 'An important part of this project is to find out how children spend their time '
      + 'during the week. Was yesterday a typical weekday for you and your child? A non-typical day would include '
      + 'a school closing, being on vacation, or being home sick.',
  [WAKE_UP_COUNT]: 'Last night, how many times did your child wake up in the middle of the night?'
};

export default SCHEMA_FIELDS_TITLES;
