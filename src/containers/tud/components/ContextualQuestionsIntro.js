// @flow

import React from 'react';

import { Typography } from 'lattice-ui-kit';

type Props = {
  selectedActivity :string;
  time :string;
};

const ContextualQuestionsIntro = ({ selectedActivity, time } :Props) => (
  <>
    <Typography variant="body2">
      <span>Now, let&apos;s talk about what your child did while </span>
      <span>
        <strong>
          { selectedActivity }
        </strong>
      </span>
      <span> at </span>
      <strong>
        { time}
      </strong>
      <span>.</span>
    </Typography>
    <br />
  </>
);

export default ContextualQuestionsIntro;
