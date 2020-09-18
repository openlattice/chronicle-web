// @flow

import { PROPERTY_CONSTS } from './SchemaConstants';

const {
  ADULT_MEDIA,
  ADULT_MEDIA_PROPORTION,
  ADULT_MEDIA_PURPOSE,
  BEHAVIOR_AFTER,
  BEHAVIOR_BEFORE,
  BG_AUDIO,
  BG_AUDIO_TYPE,
  BG_MEDIA_PROPORTION,
  BG_TV,
  BG_TV_AGE,
  BOOK_TITLE,
  BOOK_TYPE,
  CAREGIVER,
  DAY_END_TIME,
  DAY_OF_WEEK,
  DAY_START_TIME,
  DEVICE,
  LOCATION,
  MEDIA,
  MEDIA_ACTIVITY,
  MEDIA_AGE,
  MEDIA_NAME,
  NON_TYPICAL_DAY_REASON,
  NON_TYPICAL_SLEEP_PATTERN,
  OTHER_MEDIA,
  PROGRAM_AGE,
  SECONDARY_LOCATION,
  SLEEP_ARRANGEMENT,
  SLEEP_PATTERN,
  TYPICAL_DAY_FLAG,
  WAKE_UP_COUNT,
} = PROPERTY_CONSTS;

const SCHEMA_FIELDS_TITLES = {
  [ADULT_MEDIA]: 'Was an adult using a tablet, laptop, cell phone/smart '
      + 'phone at any point while your child did this activity?',
  [ADULT_MEDIA_PROPORTION]: 'Approximately what percentage of the time for this activity were you using your device? '
      + 'For example, if your child was using media for 2 hours and you used your device for 1 hour, '
      + 'enter 50; if you used your device the entire time, enter 100.',

  [ADULT_MEDIA_PURPOSE]: 'What was the tablet/laptop/cell phone/smart phone used for?',
  [BEHAVIOR_AFTER]: 'How was your child behaving just after this activity ended?',
  [BEHAVIOR_BEFORE]: 'How was your child behaving just before this activity began?',
  [BG_AUDIO]: 'Was there audio entertainment (e.g., music, talk radio) '
      + 'on in the background while your child was doing this activity?',
  [BG_AUDIO_TYPE]: 'What kind of audio was in the background?',
  [BG_MEDIA_PROPORTION]: 'Approximately what percentage of time that the child was'
      + 'sleeping was the background media in use? '
      + 'For example, if your child slept for 10 hours and the radio was on for 1, '
      + 'enter 10; if on the full time, enter 100.',
  [BG_TV]: 'Was there a TV on in the background while your child did this activity?',
  [BG_TV_AGE]: 'Was the program for your child\'s age, for older children, '
      + 'for younger children, or for adults?',
  [BOOK_TITLE]: 'What was the title of the book(s)'
    + ' If you are unsure of exact title, either describe (e.g., a book about unicorns)'
    + ' or leave it blank',
  [BOOK_TYPE]: 'Specifically, what type(s) of book did your child read?',
  [CAREGIVER]: 'Who was with your child when he/she was doing this? Please choose all that apply.',
  [DAY_OF_WEEK]: 'We would like you to think about your child\'s day and complete the time use diary for yesterday. '
      + 'What day of the week was yesterday?',
  [DAY_END_TIME]: 'What time did your child go to bed yesterday night?',
  [DAY_START_TIME]: 'What time did your child wake up yesterday morning?',
  [DEVICE]: 'Specifically, what device(s) was your child using? Select all applicable.',
  [LOCATION]: 'Where was your child when he/she was doing this activity?',
  [MEDIA]: 'Was media being used at the same time as this activity, such as '
      + 'television, movies, video or computer games, '
      + 'books, magazines, radio or CDs, cell phone/smart phone, laptop or a tablet?',
  [MEDIA_ACTIVITY]: 'Specifically, what primary media activity was your child engaged in?',
  [MEDIA_AGE]: 'Was the media content directed at your child\'s age, '
      + 'older children, younger children, or adults?',
  [MEDIA_NAME]: 'What was the name of the media used? (e.g. name of show, book, movie). '
      + 'If you are unsure of exact name, either describe (e.g., a drawing app, a movie about unicorns) '
      + 'or leave blank',
  [NON_TYPICAL_DAY_REASON]: 'What made yesterday a non-typical day?',
  [NON_TYPICAL_SLEEP_PATTERN]: 'What made your child\'s sleeping pattern non-typical?',
  [OTHER_MEDIA]: 'Was any other media being used at the same time as this activity, '
      + 'such as television, movies, video or computer games, books, magazines, '
      + 'radio or CDs, cell phone/smart phone, laptop or a tablet?',
  [PROGRAM_AGE]: 'Was the program (e.g., show, app, movie, book, etc.) for your child\'s age, '
      + 'for older children, for younger children, or for adults?',
  [SECONDARY_LOCATION]: 'Where was your child when he/she was doing this activity?',
  [SLEEP_ARRANGEMENT]: 'Las night, what was your child\'s sleeping arrangement?',
  [SLEEP_PATTERN]: 'Last night, was your child\'s sleep pattern typical?',
  [TYPICAL_DAY_FLAG]: 'An important part of this project is to find out how children spend their time '
      + 'during the week. Was yesterday a typical weekday for you and your child? A typical day would include '
      + 'a school closing, being on vacation, or being home sick.',
  [WAKE_UP_COUNT]: 'Last night, how many ties did your child wake up in the middle of the night?'
};

export default SCHEMA_FIELDS_TITLES;
