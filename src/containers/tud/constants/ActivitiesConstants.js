// @flow

// primary activities
const CHILDCARE = 'Childcare/School';
const EATING_DRINKING = 'Eating/Drinking';
const GROOMING = 'Bathroom/Grooming';
const INDOORS = 'In House (Chores, etc)';
const MEDIA = 'Media Use (TV, Books, Apps, etc)';
const OTHER = 'Other/don\'t know';
const OUTDOORS = 'Out of the House (Travelling/Errands)';
const RECREATION_INSIDE = 'Play/Recreation Inside';
const RECREATION_OUTSIDE = 'Play/Recreation Outside';
const SLEEPING = 'Sleeping/Resting';

const ACTIVITY_NAMES = {
  CHILDCARE,
  EATING_DRINKING,
  GROOMING,
  INDOORS,
  MEDIA,
  OTHER,
  RECREATION_INSIDE,
  RECREATION_OUTSIDE,
  SLEEPING,
  OUTDOORS,
};

const PRIMARY_ACTIVITIES = [
  { name: SLEEPING, description: 'sleeping/resting', followup: true },
  { name: EATING_DRINKING, description: 'eating/drinking', followup: true },
  { name: GROOMING, description: 'grooming', followup: false },
  { name: MEDIA, description: 'using media', followup: true },
  { name: RECREATION_INSIDE, description: 'indoor recreation', followup: true },
  { name: RECREATION_OUTSIDE, description: 'outdoor recreation', followup: true },
  { name: CHILDCARE, description: 'child care', followup: false },
  { name: OUTDOORS, description: 'travelling/running errands', followup: true },
  { name: INDOORS, description: 'chores', followup: false },
  { name: OTHER, description: '', followup: false }
];

export {
  ACTIVITY_NAMES,
  PRIMARY_ACTIVITIES
};
