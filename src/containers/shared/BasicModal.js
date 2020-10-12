// @flow

import React from 'react';
import { Modal } from 'lattice-ui-kit';

import styled from 'styled-components';

const ModalBody = styled.div`
  max-width: 400px;
`;

type Props ={
  handleOnClose :() => void;
  isVisible :boolean;
  contentText :string;
  title :string;
};

const BasicModal = ({
  contentText,
  handleOnClose,
  isVisible,
  title
} :Props) => (
  <Modal
      isVisible={isVisible}
      onClose={handleOnClose}
      textSecondary="Close"
      textTitle={title}>
    <ModalBody>
      <p>
        { contentText }
      </p>
    </ModalBody>
  </Modal>
);

export default BasicModal;
