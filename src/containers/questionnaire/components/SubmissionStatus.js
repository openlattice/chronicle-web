// @flow

import React, { useState } from 'react';

import styled from 'styled-components';
import { faCheckCircle } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Colors, Modal } from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';

import { resetRequestState } from '../../../core/redux/ReduxActions';
import { SUBMIT_QUESTIONNAIRE } from '../QuestionnaireActions';

const { GREEN, NEUTRAL } = Colors;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
    font-size: 15px;
  }
`;
type Props = {
  success ?:boolean;
}

const SubmissionStatus = (props :Props) => {
  const { success } = props;

  const dispatch = useDispatch();
  const [isModalOpen, setModalOpen] = useState(true);

  const onCloseModal = () => {
    setModalOpen(false);
    dispatch(resetRequestState(SUBMIT_QUESTIONNAIRE));
  };

  if (success) {
    return (
      <Wrapper>
        <FontAwesomeIcon color={GREEN.G300} icon={faCheckCircle} size="3x" />
        <h3>Submission Successful!</h3>
        <p>Your responses were successfully submitted.</p>
      </Wrapper>
    );
  }
  return (
    <Modal
        isVisible={isModalOpen}
        onClose={onCloseModal}
        textSecondary="Close"
        textTitle="Submission Failure">
      <div>
        <p>
          An error occurred while submitting. Please try again later or contact support.
        </p>
      </div>
    </Modal>
  );
};

SubmissionStatus.defaultProps = {
  success: false
};

export default SubmissionStatus;
