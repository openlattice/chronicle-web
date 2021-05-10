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

const ButtonGrid = styled.div`
  display: grid;
  align-items: center;
  justify-content: space-between;
  padding-top: 30px;
  padding-bottom: '30px';
  grid-template-columns: 1fr;
  grid-gap: 10px;
`;

type Props = {
  handleOnClose :() => void;
  isVisible :boolean;
  participantEntityKeyId :UUID;
  participantId :UUID;
  selectedOrgId :UUID;
  studyEntityKeyId :UUID;
  studyId :UUID;
}

const DownloadParticipantDataModal = (props :Props) => {
  const {
    handleOnClose,
    isVisible,
    participantEntityKeyId,
    participantId,
    selectedOrgId,
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
      const downloadUrl = getParticipantDataUrl(dataType, participantEntityKeyId, studyId, selectedOrgId);
      window.open(downloadUrl, '_blank');
    }
  };

  const handleOnCloseQuestionnaireModal = () => {
    setQuestionnaireModalOpen(false);
    handleOnClose();
  };

  const renderModalBody = () => (
    <div>
      <p>
        What kind of data do you want to download?
      </p>
      <ButtonGrid>
        <Button color="secondary" name={RAW} onClick={handleOnClick}>
          Raw Data
        </Button>

        <Button color="secondary" name={PREPROCESSED} onClick={handleOnClick}>
          Preprocessed Data
        </Button>

        <Button color="secondary" name={APP_USAGE} onClick={handleOnClick}>
          App Usage
        </Button>

        <Button color="secondary" name={QUESTIONNAIRE_RESPONSES} onClick={handleOnClick}>
          Questionnaire Responses
        </Button>
      </ButtonGrid>
    </div>
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
