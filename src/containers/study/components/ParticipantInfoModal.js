// @flow

import React from 'react';

import styled from 'styled-components';
import { faCopy } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  IconButton,
  Modal,
  Tooltip,
  Typography
} from 'lattice-ui-kit';

import copyToClipboard from '../../../utils/copyToClipboard';
import { useHasQuestionnairesModule } from '../../shared/hooks';
import { getParticipantLoginLink, getTimeUseDiaryLink } from '../utils';

const ModalWrapper = styled.div`
  max-width: 500px;
`;

const DetailWrapper = styled.div`
  margin-bottom: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 20px;
  align-items: center;
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
            <DetailWrapper key={detail.name}>
              <Typography variant="body2">
                {detail.name}
              </Typography>
              <Grid>
                <Typography variant="body1">
                  { detail.value }
                </Typography>
                <Tooltip
                    arrow
                    placement="top"
                    title="Copy to clipboard">
                  <IconButton
                      aria-label={`Copy ${detail.name}`}
                      onClick={() => copyToClipboard(detail.value)}>
                    <FontAwesomeIcon icon={faCopy} />
                  </IconButton>
                </Tooltip>
              </Grid>
            </DetailWrapper>
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
