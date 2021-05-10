// @flow

import React from 'react';

import { faCheckCircle } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  // $FlowFixMe
  Box,
  Colors,
  Typography
} from 'lattice-ui-kit';

import TranslationKeys from '../constants/TranslationKeys';

const { GREEN } = Colors;

type Props = {
  trans :TranslationFunction;
}
const SubmissionSuccessful = ({ trans } :Props) => (
  <Box textAlign="center" mt="30px">
    <FontAwesomeIcon color={GREEN.G300} icon={faCheckCircle} size="3x" />
    <Box mt="5px" mb="5px" fontWeight={500} fontSize="20px">
      {trans(TranslationKeys.SUBMISSION_SUCCESS_TITLE)}
    </Box>
    <Typography>
      {trans(TranslationKeys.SUBMISSION_SUCCESS)}
    </Typography>
  </Box>
);

export default SubmissionSuccessful;
