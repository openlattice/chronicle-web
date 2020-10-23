// @flow

import { PROPERTY_CONSTS } from './SchemaConstants';

const SCHEMA_FIELDS_TITLES = {
  [PROPERTY_CONSTS.BOOK_TITLE]: 'What was the name of the book?'
    + ' If you are don\'t know the exact name, you can give a general description (e.g., a book about unicorns).',
  [PROPERTY_CONSTS.BOOK_TYPE]: 'Specifically, what type(s) of book did your child read?',
  [PROPERTY_CONSTS.DAY_OF_WEEK]: 'We would like you to think about your child\'s day and complete'
      + ' the time use diary for yesterday. What day of the week was yesterday?',
  [PROPERTY_CONSTS.DAY_END_TIME]: 'What time did your child go to bed yesterday night?'
     + ' Please think about when your child first fell asleep for the night.'
     + ' Later in the survey, we will ask about how often your child woke up in the middle of the night.',
  [PROPERTY_CONSTS.DAY_START_TIME]: 'What time did your child wake up yesterday morning?'
     + ' Please think about when your child woke up for the day, rather'
     + ' than waking up in the middle of the night and going back to sleep.',
  [PROPERTY_CONSTS.SCREEN_MEDIA_ACTIVITY]: 'Specifically, what did your child do while using screen media?',
  [PROPERTY_CONSTS.SCREEN_MEDIA_AGE]: 'Would you describe the program (e.g., TV show, app) as for your'
    + ' child’s age, for older children, for younger children, or for adults?',
  [PROPERTY_CONSTS.SCREEN_MEDIA_NAME]: 'What was the name of the media program (e.g., name of the show or app)?'
    + ' If you don’t know the exact name, you can give a general'
    + ' description (e.g., a drawing app, a movie about unicorns).',
  [PROPERTY_CONSTS.NON_TYPICAL_DAY_REASON]: 'What made yesterday a non-typical day?',
  [PROPERTY_CONSTS.NON_TYPICAL_SLEEP_PATTERN]: 'What made your child\'s sleeping pattern non-typical?',
  [PROPERTY_CONSTS.SLEEP_ARRANGEMENT]: 'Last night, what was your child\'s sleeping arrangement?',
  [PROPERTY_CONSTS.SLEEP_PATTERN]: 'Last night, was your child\'s sleep pattern typical?',
  [PROPERTY_CONSTS.TODAY_WAKEUP_TIME]: 'What time did your child wake up this morning?',
  [PROPERTY_CONSTS.TYPICAL_DAY_FLAG]: 'An important part of this project is to find out how children spend their time '
      + 'during the week. Was yesterday a typical weekday for you and your child? A non-typical day would include '
      + 'a school closing, being on vacation, or being home sick.',
  [PROPERTY_CONSTS.WAKE_UP_COUNT]: 'Last night, how many times did your child wake up in the middle of the night?'
};

export default SCHEMA_FIELDS_TITLES;
