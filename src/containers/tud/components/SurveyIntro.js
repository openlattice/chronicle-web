// @flow

import React from 'react';

import { Typography } from 'lattice-ui-kit';

const INTRO_TEXT = 'Thank you for taking the time to complete this survey!'
  + ' First, we will ask you to describe everything your child did yesterday,'
  + ' starting when your child woke up yesterday morning and ending when they'
  + ' went to bed last night. Then, we will ask how your child slept last night.'
  + ' Please answer the questions to the best of your ability.'
  + ' At the end of the survey, you will be able to make changes if you want.';

const SurveyIntro = () => (

  <Typography gutterBottom variant="body2">
    { INTRO_TEXT }
  </Typography>
);

export default SurveyIntro;
