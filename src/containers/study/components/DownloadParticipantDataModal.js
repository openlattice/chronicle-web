// @flow

import React from 'react';

import styled from 'styled-components';
import {
  Modal,
  Button
} from 'lattice-ui-kit';

import ParticipantDataTypes from '../../../utils/constants/ParticipantDataTypes';
import type { ParticipantDataType } from '../../../utils/constants/ParticipantDataTypes';
import { getParticipantDataUrl } from '../../../utils/AppUtils';

const { PREPROCESSED, RAW, APP_USAGE } = ParticipantDataTypes;

const ModalWrapper = styled.div`
  min-width: 400px;
  padding-bottom: 30px;
`;

const ButtonGrid = styled.div`
  display: grid;
  align-items: center;
  justify-content: space-between;
  padding-top: 30px;
  grid-template-columns: repeat(1, minmax(100px, 1fr));
  grid-gap: 10px;
`;


type Props = {
  handleOnClose :() => void;
  isVisible :boolean;
  participantEntityKeyId:?UUID;
  studyId :UUID;
}

const DownloadParticipantDataModal = (props :Props) => {
  const {
    handleOnClose,
    isVisible,
    participantEntityKeyId,
    studyId,
  } = props;

  const handleOnClick = (event :SyntheticEvent<HTMLButtonElement>) => {
    const { currentTarget } = event;
    const { name } = currentTarget;

    let dataType;
    switch (name) {
      default:
        dataType = ParticipantDataType.RAW;
        break;
      case PREPROCESSED:
        dataType = ParticipantDataTypes.PREPROCESSED;
        break;
      case APP_USAGE:
        dataType = ParticipantDataTypes.APP_USAGE;
        break;
    }

    if (participantEntityKeyId != null) {
      const downloadUrl = getParticipantDataUrl(dataType, participantEntityKeyId, studyId);
      window.open(downloadUrl, '_blank');
    }
  };

  const renderModalBody = () => (
    <ModalWrapper>
      <p>
        What kind of data do you want to download?
      </p>
      <ButtonGrid>
        <Button mode="secondary" name={RAW} onClick={handleOnClick}>
          Raw Data
        </Button>

        <Button mode="secondary" name={PREPROCESSED} onClick={handleOnClick}>
          Preprocessed Data
        </Button>

        <Button mode="secondary" name={APP_USAGE} onClick={handleOnClick}>
          App Usage
        </Button>

        <Button onClick={handleOnClose}>
          Close
        </Button>
      </ButtonGrid>
    </ModalWrapper>
  );

  return (
    <Modal
        isVisible={isVisible}
        onClose={handleOnClose}
        textTitle="Download Data">
      {renderModalBody()}
    </Modal>
  );
};

export default DownloadParticipantDataModal;
