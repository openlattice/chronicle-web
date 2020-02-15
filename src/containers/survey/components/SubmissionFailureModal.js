// @flow

import React from 'react';
import { Modal } from 'lattice-ui-kit';

import styled from 'styled-components';

const ModalBody = styled.div`
  max-width: 400px;
`;

type Props ={
  handleOnClose :(event :SyntheticEvent<HTMLButtonElement>) => void;
  isVisible :boolean;
}
const SubmissionFailureModal = (props :Props) => {
  const { handleOnClose, isVisible } = props;
  return (
    <Modal
        isVisible={isVisible}
        onClose={handleOnClose}
        textSecondary="Cancel"
        textTitle="Submission Failure">
      <ModalBody>
        <p>
          An error occurred while submitting. Please try again later or contact support
        </p>
      </ModalBody>
    </Modal>
  );
};

export default SubmissionFailureModal;
