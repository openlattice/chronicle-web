// @flow

import React from 'react';

import { Typography } from 'lattice-ui-kit';

const INTRO_TEXT = 'Thank you for taking the time to complete this survey!';

const SurveyIntro = () => (
  <Typography component="div">
    <Typography variant="body1">
      { INTRO_TEXT }
    </Typography>
    <br />
  </Typography>
);

export default SurveyIntro;
