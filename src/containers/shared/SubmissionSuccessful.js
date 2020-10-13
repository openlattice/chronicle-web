// @flow

import React from 'react';
import type { Node } from 'react';

import styled from 'styled-components';
import { faCheckCircle } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Colors,
  Typography
} from 'lattice-ui-kit';

const { NEUTRAL, GREEN } = Colors;
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
type Props = {
  children ?:Node;
}
const SubmissionSuccessful = ({ children } :Props) => (
  <Wrapper>
    <FontAwesomeIcon color={GREEN.G300} icon={faCheckCircle} size="3x" />
    <Typography variant="h3"> Submission Successful! </Typography>
    { children }
  </Wrapper>
);

SubmissionSuccessful.defaultProps = {
  children: undefined
};

export default SubmissionSuccessful;
