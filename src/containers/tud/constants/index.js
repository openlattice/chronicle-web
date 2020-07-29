// @flow

const SCHEMA_CONSTANTS = {
  ACTIVITY_END_TIME: 'endTime',
  ACTIVITY_NAME: 'activity',
  ACTIVITY_START_TIME: 'startTime',
  DAYS_OF_WEEK: 'daysOfWeek',
  DAY_END_TIME: 'dayEndTime',
  DAY_START_TIME: 'dayStartTime',
  NON_TYPICAL_DAY_REASON: 'nonTypicalDayReason',
  TYPICAL_DAY_FLAG: 'typicalDay',
};

const NON_TYPICAL_DAY_REASONS = [
  'Child was sick',
  'School/childcare was closed',
  'Snow day',
  'Vacation',
  'Family visit'
];

const ACTIVITIES = [
  { name: 'Sleeping/Resting', description: 'sleeping/resting' },
  { name: 'Eating/Drinking', description: 'eating/drinking' },
  { name: 'Bathroom/Grooming', description: 'grooming' },
  { name: 'Media Use (Tv, Books, Apps, etc)', description: 'using media' },
  { name: 'Play/ Recreation Inside', description: 'indoor recreation' },
  { name: 'Play/ Recreation Outside', description: 'outdoor recreation' },
  { name: 'Childcare/ School', description: 'child care' },
  { name: 'Out of the House (Travelling/Errands)', description: 'travelling/running errands' },
  { name: 'In House (Chores, etc)', description: 'chores' },
  { name: 'Other/don\'t know', description: '' }
];

export {
  ACTIVITIES,
  SCHEMA_CONSTANTS,
  NON_TYPICAL_DAY_REASONS
};
