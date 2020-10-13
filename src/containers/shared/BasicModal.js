// @flow

import React from 'react';
import type { Node } from 'react';

import styled from 'styled-components';
import { Modal } from 'lattice-ui-kit';

const ModalBody = styled.div`
  max-width: 400px;
`;

type Props ={
  handleOnClose :() => void;
  isVisible :boolean;
  children ?:Node;
  title :string;
};

const BasicModal = ({
  children,
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
      { children }
    </ModalBody>
  </Modal>
);

BasicModal.defaultProps = {
  children: undefined
};

export default BasicModal;
