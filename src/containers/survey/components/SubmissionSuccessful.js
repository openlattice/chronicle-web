// @flow

import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/pro-regular-svg-icons';
import {
  Colors,
} from 'lattice-ui-kit';

const { NEUTRAL, GREEN } = Colors;
const Wrapper = styled.div`
  align-items: center;
  color: ${NEUTRAL.N900};
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 30px 0;
  text-align: center;

  > h3 {
    font-size: 18px;
    font-weight: 500;
    margin: 5px 0;
    padding: 0;
  }

  > p {
    color: ${NEUTRAL.N800};
    font-size: 15px;
    font-weight: 400;
    margin: 0;
    padding: 0;
  }
`;
const SubmissionSuccessful = () => (
  <Wrapper>
    <FontAwesomeIcon color={GREEN.G300} icon={faCheckCircle} size="3x" />
    <h3> Submission Successful! </h3>
    <p> Thank you for participating in chronicle user awareness survey </p>
  </Wrapper>
);

export default SubmissionSuccessful;
