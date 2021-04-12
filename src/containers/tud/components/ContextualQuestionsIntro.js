// @flow

import React from 'react';

import { Typography } from 'lattice-ui-kit';
import { DateTime } from 'luxon';

import TranslationKeys from '../constants/TranslationKeys';

// selected activity -> map to key -> get the corresponding str
type Props = {
  selectedActivity :string;
  time :DateTime;
  trans :(string, ?Object) => Object;
};

const ContextualQuestionsIntro = ({ selectedActivity, time, trans } :Props) => {
  const activities = trans(TranslationKeys.PRIMARY_ACTIVITIES, { returnObjects: true });
  const activity = Object.values(activities).find((val) => val === selectedActivity);
  if (!activity) return null;

  return (
    <Typography gutterBottom variant="body2">
      {
        trans(
          TranslationKeys.CONTEXTUAL_TEXT,
          { time: time.toLocaleString(DateTime.TIME_SIMPLE), activity, interpolation: { escapeValue: false } }
        )
      }
    </Typography>
  );
};

export default ContextualQuestionsIntro;
