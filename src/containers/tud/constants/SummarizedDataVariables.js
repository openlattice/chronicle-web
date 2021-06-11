// flow

import { OrderedSet } from 'immutable';

// These are the column headers in the csv summary data
// TODO: verify that this is the expected order
export default OrderedSet.of(
  'sleepArrangement',
  'primary_media_blocks',
  'primary_childcare_mins',
  'primary_childcare_blocks',
  'primary_media_mins',
  'dayStartTime',
  'dayOfWeek',
  'adultMedia_mins',
  'bgTvDay_blocks',
  'adultMedia_blocks',
  'primary_other_at_home_mins',
  'primary_play_outside_blocks',
  'bgAudioDay_mins',
  'primary_play_inside_mins',
  'typicalSleepPattern',
  'todayWakeUpTime',
  'screen_1hfromsleeping_blocks',
  'typicalDay',
  'primary_eating_mins',
  'screen_during_Eating_proportion',
  'bgAudioNight',
  'bgTvNight',
  'primary_other_at_home_blocks',
  'nonTypicalSleepReason',
  'primary_bathroom_blocks',
  'primary_media_coviewers_blocks',
  'dayEndTime',
  'primary_play_inside_blocks',
  'bgMediaDay_mins',
  'primary_eating_blocks',
  'primary_reading_blocks',
  'primary_media_coviewers_mins',
  'primary_reading_mins',
  'bgAudioDay_blocks',
  'wakeUpCount',
  'screen_during_Playing_proportion',
  'bgMediaDay_blocks',
  'screen_during_sleeping_proportion',
  'primary_bathroom_mins',
  'bgTvDay_mins',
  'primary_play_outside_mins'
);
