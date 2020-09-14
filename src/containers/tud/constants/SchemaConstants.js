// @flow

const PROPERTY_CONSTS = {
  ACTIVITY_END_TIME: 'endTime',
  ACTIVITY_NAME: 'activity',
  ACTIVITY_START_TIME: 'startTime',
  ADULT_MEDIA: 'adultMedia',
  ADULT_MEDIA_PROPORTION: 'adultMediaProportion',
  ADULT_MEDIA_PURPOSE: 'adultMediaPurpose',
  BEHAVIOR_AFTER: 'behaviorAfter',
  BEHAVIOR_BEFORE: 'behaviorBefore',
  BG_AUDIO: 'audio',
  BG_AUDIO_TYPE: 'audioType',
  BG_MEDIA_PROPORTION: 'proportion',
  BG_TV: 'backgroundTv',
  BG_TV_AGE: 'bgTvAge',
  BOOK_TITLE: 'bookTitle',
  BOOK_TYPE: 'bookType',
  CAREGIVER: 'careGiver',
  DAY_END_TIME: 'dayEndTime',
  DAY_OF_WEEK: 'daysOfWeek',
  DAY_START_TIME: 'dayStartTime',
  DEVICE: 'device',
  FOLLOWUP_COMPLETED: 'followUpCompleted',
  LOCATION: 'location',
  MEDIA: 'media',
  MEDIA_ACTIVITY: 'mediaActivity',
  MEDIA_AGE: 'mediaAge',
  MEDIA_NAME: 'mediaName',
  NON_TYPICAL_DAY_REASON: 'nonTypicalDayReason',
  OTHER_ACTIVITY: 'otherActivity',
  OTHER_MEDIA: 'otherMedia',
  PROGRAM_AGE: 'programAge',
  SECONDARY_ACTIVITY: 'secondaryActivity',
  SECONDARY_LOCATION: 'secondaryLocation',
  TYPICAL_DAY_FLAG: 'typicalDay',
};

const MEDIA_DEVICE_TYPES = [
  'Television set',
  'Computer (desktop or laptop)',
  'Smartphone (e.g. iPhone)',
  'Touchscreen tablet/device (e.g. iPad, iPod Touch, Galaxy Tab, Nook, Kindle, Fire 7)',
  'Video player (e.g. DVD, DVR, or VCR)',
  'Console gaming system (e.g. Wii, xBox)',
  'Handheld gaming device (e.g. 3DS)',
  'Went to a move in a movie theater or outdoor theater'
];

const MEDIA_ACTIVITY_CATEGORIES = [
  `Watched video content (e.g. TV show, movie, video clips using a
    streaming service (e.g Netflix, Youtube, Amazon Prime, Hulu))`,
  'Played games (including playing on an app, a console, or a handheld device)',
  'Video chat (e.g. Facetime, Skype, Google Hangout)',
  'Communicated with others in another way (e.g. talked on phone, helped to write a text message)',
  'Created content (e.g. recorded video, took photographs)',
  'Looked up information on the internet'
];

const CAREGIVERS = [
  'Mother/Mother figure',
  'Father/Father figure',
  'Grandparent',
  'Sibling',
  'Other relative',
  'Childcare provider/nanny/babysitter',
  'Other kids'
];

const ADULT_MEDIA_PURPOSES = [
  'Work call',
  'Work email',
  'Review of documents for work',
  'Social call',
  'Entertainment',
  'Social media',
];

const ADULT_MEDIA_USAGE_TYPES = [
  'None of the time',
  'Some of the time',
  'Half of the time',
  'Most of the time',
  'The entire time'
];

const CHILD_BEHAVIOR_CATEGORIES = [
  'Calm',
  'Whiny/bored',
  'Active, but positive/cheerful',
  'Active, with negative behaviors/cranky',
  'Difficult to control',
  "Don't know"
];

const LOCATION_CATEGORIES = [
  'Room where child sleeps',
  'In some other room in the house (e.g. kitchen, family room)',
  'Outdoors (e.g. park or yard)',
  'Library, museum, restaurant, grocery store, or shopping center',
  'While travelling (e.g. car, train, or school bus)',
  'Multiple locations',
  'Other (e.g. another person\'s house, church)'
];

const SECONDARY_LOCATIONS = [
  'While travelling (e.g. car, train, or school bus)',
  'Restaurant, grocery store, or shopping center',
  'Other'
];

const NON_TYPICAL_DAY_REASONS = [
  'Child was sick',
  'School/childcare was closed',
  'Snow day',
  'Vacation',
  'Family visit'
];

const BOOK_TYPES = ['Paper book', 'eBook'];

export {
  ADULT_MEDIA_USAGE_TYPES,
  ADULT_MEDIA_PURPOSES,
  BOOK_TYPES,
  CAREGIVERS,
  CHILD_BEHAVIOR_CATEGORIES,
  LOCATION_CATEGORIES,
  MEDIA_ACTIVITY_CATEGORIES,
  MEDIA_DEVICE_TYPES,
  NON_TYPICAL_DAY_REASONS,
  PROPERTY_CONSTS,
  SECONDARY_LOCATIONS,
};
