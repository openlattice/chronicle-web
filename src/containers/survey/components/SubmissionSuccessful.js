// @flow

import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/pro-regular-svg-icons';
import {
  Colors,
} from 'lattice-ui-kit';

const { NEUTRAL, GREEN_2 } = Colors;
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 30px 0;
  color: ${NEUTRAL.N900};

  > h3 {
    margin: 5px 0;
    padding: 0;
    font-weight: 500;
    font-size: 18px;
  }

  > p {
    margin: 0;
    padding: 0;
    font-weight: 400;
    color: ${NEUTRAL.N800};
    font-size: 15px;
  }
`;
const SubmissionSuccessful = () => (
  <Wrapper>
    <FontAwesomeIcon color={GREEN_2} icon={faCheckCircle} size="3x" />
    <h3> Submission Successful! </h3>
    <p> Thank you for participating in chronicle user awareness survey </p>
  </Wrapper>
);

export default SubmissionSuccessful;
