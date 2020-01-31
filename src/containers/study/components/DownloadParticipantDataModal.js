// @flow

import React, { useState } from 'react';

import styled from 'styled-components';
import {
  Checkbox,
  ChoiceGroup,
  Modal,
} from 'lattice-ui-kit';

import ParticipantDataTypes from '../../../utils/constants/ParticipantDataTypes';
import { getParticipantDataUrl } from '../../../utils/api/AppApi';

const { PREPROCESSED, RAW } = ParticipantDataTypes;

type Props = {
  handleOnClose :() => void;
  isVisible :boolean;
  participantEntityKeyId:?UUID;
  studyId :UUID;
}

const ModalWrapper = styled.div`
  min-width: 400px;
`;

const DownloadParticipantDataModal = (props :Props) => {
  const {
    handleOnClose,
    isVisible,
    participantEntityKeyId,
    studyId
  } = props;

  const [rawDataSelected, setRawDataSelected] = useState(true);
  const [preprocessedSelected, setPreprocessedSelected] = useState(true);

  const handleOnDownload = () => {
    if (participantEntityKeyId != null) {
      let dataUrl;

      if (rawDataSelected) {
        dataUrl = getParticipantDataUrl(RAW, participantEntityKeyId, studyId);
        window.open(dataUrl, '_blank');
      }

      /*
       * A second download works on Safari 13.0.
       * However Chrome and Firefox will block unless the user enables popups
       */
      if (preprocessedSelected) {
        dataUrl = getParticipantDataUrl(PREPROCESSED, participantEntityKeyId, studyId);
        window.open(dataUrl, '_blank');
      }
    }
    handleOnClose();
  };

  const renderModalBody = () => (
    <ModalWrapper>
      <p style={{ fontWeight: 500 }}> Select type of data to download. </p>
      <ChoiceGroup>
        <Checkbox
            checked={rawDataSelected}
            label="Raw Data"
            onChange={() => setRawDataSelected(!rawDataSelected)} />
        <Checkbox
            checked={preprocessedSelected}
            label="Preprocessed Data"
            onChange={() => setPreprocessedSelected(!preprocessedSelected)} />
      </ChoiceGroup>
    </ModalWrapper>
  );

  return (
    <Modal
        isVisible={isVisible}
        onClickPrimary={handleOnDownload}
        onClose={handleOnClose}
        textPrimary="Download"
        textSecondary="Cancel"
        textTitle="Download Data">
      {renderModalBody()}
    </Modal>
  );
};

export default DownloadParticipantDataModal;
