// @flow

import React from 'react';

import styled from 'styled-components';
import { faClipboard } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from 'lattice-ui-kit';

import { useHasQuestionnairesModule } from '../../shared/hooks';
import { getParticipantLoginLink, getTimeUseDiaryLink } from '../utils';

const ModalWrapper = styled.div`
  width: 500px;
`;

const InfoWrapper = styled.div`
  margin-bottom: 20px;

  > h4 {
    font-size: 16px;
    font-weight: 500;
    margin: 5px 0;
    padding: 0;
  }

  > p {
    font-size: 15px;
    font-weight: 300;
    margin: 5px 0;
    padding: 0;
  }
`;
type Props = {
  handleOnClose :() => void;
  isVisible :boolean;
  orgId :UUID;
  participantId :UUID;
  studyId :UUID;
}

const ParticipantInfoModal = ({
  handleOnClose,
  isVisible,
  orgId,
  participantId,
  studyId
} :Props) => {

  const hasQuestionnaireModule = useHasQuestionnairesModule();

  const renderParticipantInfo = () => {
    const participantLoginLink = getParticipantLoginLink(orgId, studyId, participantId);
    const timeUseDiaryLink = getTimeUseDiaryLink(orgId, studyId, participantId);

    const participantDetails = [
      { name: 'Participant ID', value: participantId },
      { name: 'Study ID', value: studyId },
      { name: 'Enrollment Link', value: participantLoginLink }
    ];
    if (hasQuestionnaireModule) {
      participantDetails.push({
        name: 'Time Use Diary Link',
        value: timeUseDiaryLink
      });
    }

    return (
      <ModalWrapper>
        {
          participantDetails.map((detail) => (
            <InfoWrapper key={detail.name}>
              <h4>
                {detail.name}
              </h4>
              <p>
                { detail.value }
              </p>
            </InfoWrapper>
          ))
        }
      </ModalWrapper>
    );
  };

  return (
    <Modal
        isVisible={isVisible}
        onClose={handleOnClose}
        textSecondary="Close"
        textTitle="Participant Info">
      {renderParticipantInfo()}
    </Modal>
  );
};

export default ParticipantInfoModal;
