// @flow

const SLEEPING_ACTIVITY_CONSTS = {
  MEDIA: 'media',
  BG_TV: 'tv',
  BG_TV_AGE: 'age',
  BG_AUDIO: 'audio',
  BG_AUDIO_TYPE: 'audioType',
  BG_MEDIA_PROPORTION: 'proportion'
};

const EATING_ACTIVITY_CONSTS = {
  ADULT_MEDIA: 'adultMedia',
  BG_AUDIO: 'audio',
  BG_AUDIO_TYPE: 'audioType',
  BG_TV: 'tv',
  BG_TV_AGE: 'age',
  CAREGIVER: 'careGiver',
  LOCATION: 'location',
  MEDIA: 'media',
};

const MEDIA_USE_CONSTS = {
  ADULT_MEDIA: 'adultMedia',
  ADULT_MEDIA_PROPORTION: 'adultMediaProportion',
  ADULT_MEDIA_PURPOSE: 'adultMediaPurpose',
  BEHAVIOR_AFTER: 'behaviorAfter',
  BEHAVIOR_BEFORE: 'behaviorBefore',
  CAREGIVER: 'careGiver',
  DEVICE: 'device',
  LOCATION: 'location',
  MEDIA_ACTIVITY: 'mediaActivity',
  MEDIA_NAME: 'mediaName',
  OTHER_MEDIA: 'otherMedia',
  PROGRAM_AGE: 'programAge',
};

const MEDIA_DEVICE_TYPES = [
  'Television set',
  'Computer (desktop or laptop)',
  'Smartphone (e.g. iPhone, Galaxy)',
  'Touchscreen tablet/device (e.g. iPad, iPod Touch, Galaxy Tab, Nook, Kindle)',
  'Printed book',
  'Video player (e.g. DVD, DVR, or VCR)',
  'Console gaming system (e.g. Wii, xBox)',
  'Handheld gaming device (e.g. 3DS)',
  'Radio or CDS',
  'Went to a move in a movie theater or outdoor theater'
];

const MEDIA_ACTIVITY_CATEGORIES = [
  `Watched video content (e.g. TV show, movie, video clips using a
    streaming service (e.g Netflix, Youtube,, Amazon Prime, Hulu))`,
  'Listened to music or radio show',
  'Looked at/read/heard a story',
  'Played games (this includes playing on an app, a console, or a Handheld device)',
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

const CHILD_BEHAVIOR_CATEGORIES = [
  'Calm',
  'Whiny/bored',
  'Active, but positive/cheerful',
  'Active, with negative behaviors/cranky',
  'Difficult to control',
  "Don't know"
];

export {
  CAREGIVERS,
  CHILD_BEHAVIOR_CATEGORIES,
  EATING_ACTIVITY_CONSTS,
  MEDIA_ACTIVITY_CATEGORIES,
  MEDIA_DEVICE_TYPES,
  MEDIA_USE_CONSTS,
  SLEEPING_ACTIVITY_CONSTS,
};
