/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { Button, Modal } from 'lattice-ui-kit';

import ParticipantDataTypes from '../../../utils/constants/ParticipantDataTypes';
import { getParticipantDataUrl } from '../../../utils/AppUtils';
import DownloadQuestionnaireResponses from './DownloadQuestionnaireResponses';

const {
  APP_USAGE,
  PREPROCESSED,
  QUESTIONNAIRE_RESPONSES,
  RAW,
} = ParticipantDataTypes;

const ModalWrapper = styled.div`
  min-width: 400px;
`;

const ButtonGrid = styled.div`
  display: grid;
  align-items: center;
  justify-content: space-between;
  padding-top: 30px;
  grid-template-columns: 1fr;
  grid-gap: 10px;
`;


type Props = {
  handleOnClose :() => void;
  isVisible :boolean;
  participantEntityKeyId :UUID;
  participantId :UUID;
  studyEntityKeyId :UUID;
  studyId :UUID;
}

const DownloadParticipantDataModal = (props :Props) => {
  const {
    handleOnClose,
    isVisible,
    participantEntityKeyId,
    participantId,
    studyEntityKeyId,
    studyId
  } = props;

  const [questionnaireModalOpen, setQuestionnaireModalOpen] = useState(false);

  const handleOnClick = (event :SyntheticEvent<HTMLButtonElement>) => {
    const { currentTarget } = event;
    const { name } = currentTarget;

    let dataType;
    switch (name) {
      case PREPROCESSED:
        dataType = PREPROCESSED;
        break;
      case APP_USAGE:
        dataType = APP_USAGE;
        break;
      case QUESTIONNAIRE_RESPONSES:
        dataType = QUESTIONNAIRE_RESPONSES;
        break;
      default:
        dataType = RAW;
        break;
    }

    if (dataType === QUESTIONNAIRE_RESPONSES) {
      setQuestionnaireModalOpen(true);
      return;
    }

    if (participantEntityKeyId != null) {
      const downloadUrl = getParticipantDataUrl(dataType, participantEntityKeyId, studyId);
      window.open(downloadUrl, '_blank');
    }
  };

  const handleOnCloseQuestionnaireModal = () => {
    setQuestionnaireModalOpen(false);
    handleOnClose();
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

        <Button mode="secondary" name={QUESTIONNAIRE_RESPONSES} onClick={handleOnClick}>
          Questionnaire Responses
        </Button>
      </ButtonGrid>
    </ModalWrapper>
  );

  if (questionnaireModalOpen) {
    return (
      <DownloadQuestionnaireResponses
          isModalOpen={questionnaireModalOpen}
          onCloseModal={handleOnCloseQuestionnaireModal}
          participantEKID={participantEntityKeyId}
          participantId={participantId}
          studyEKID={studyEntityKeyId}
          studyId={studyId} />
    );
  }

  return (
    <Modal
        isVisible={isVisible}
        onClose={handleOnClose}
        textSecondary="Close"
        shoudStretchButtons
        textTitle="Download Data">
      {renderModalBody()}
    </Modal>
  );
};

export default DownloadParticipantDataModal;
