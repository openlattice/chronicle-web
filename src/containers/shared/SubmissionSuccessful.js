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
  contentText ?:string
}
const SubmissionSuccessful = ({ contentText } :Props) => (
  <Wrapper>
    <FontAwesomeIcon color={GREEN.G300} icon={faCheckCircle} size="3x" />
    <h3> Submission Successful! </h3>
    <p>
      { contentText }
    </p>
  </Wrapper>
);

SubmissionSuccessful.defaultProps = {
  contentText: 'Thank you for participating in survey. Your responses have been successfully recorded'
};

export default SubmissionSuccessful;
