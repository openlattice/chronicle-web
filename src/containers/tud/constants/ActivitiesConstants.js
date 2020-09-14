// @flow

// primary activities
const CHILDCARE = 'Childcare/School';
const EATING_DRINKING = 'Eating/Drinking';
const GROOMING = 'Bathroom/Grooming';
const PLAYING = 'Playing (e.g. indoor, outdoor)';
const MEDIA_USE = 'Using screen media (e.g TV, Apps, games, video chat)';
const READING = 'Reading (e.g. books, eBook)';
const OTHER = 'Doing other activities at home (e.g. chores, cooking)';
const OUTDOORS = 'Doing activities out of the house (e.g. traveling, errands)';
const NAPPING = 'Napping in the middle of the day';
const TRAVEL = 'Traveling (e.g. bus, taxi, car)';
const UNKNOWN = 'Don\'t know';

const ACTIVITY_NAMES = {
  CHILDCARE,
  EATING_DRINKING,
  GROOMING,
  MEDIA_USE,
  NAPPING,
  OTHER,
  OUTDOORS,
  PLAYING,
  READING,
  TRAVEL,
  UNKNOWN
};

// const PRIMARY_ACTIVITIES = [
//   { name: SLEEPING, description: 'sleeping/resting', followup: true },
//   { name: EATING_DRINKING, description: 'eating/drinking', followup: true },
//   { name: GROOMING, description: 'grooming', followup: false },
//   { name: MEDIA, description: 'using media', followup: true },
//   { name: RECREATION_INSIDE, description: 'indoor recreation', followup: true },
//   { name: RECREATION_OUTSIDE, description: 'outdoor recreation', followup: true },
//   { name: CHILDCARE, description: 'child care', followup: false },
//   { name: OUTDOORS, description: 'travelling/running errands', followup: true },
//   { name: INDOORS, description: 'chores', followup: false },
//   { name: OTHER, description: '', followup: false }
// ];
const PRIMARY_ACTIVITIES = [
  EATING_DRINKING,
  GROOMING,
  PLAYING,
  MEDIA_USE,
  READING,
  OTHER,
  TRAVEL,
  OUTDOORS,
  CHILDCARE,
  NAPPING,
];

const SECONDARY_ACTIVITIES = [
  ...PRIMARY_ACTIVITIES,
  UNKNOWN
];

export {
  ACTIVITY_NAMES,
  PRIMARY_ACTIVITIES,
  SECONDARY_ACTIVITIES
};
