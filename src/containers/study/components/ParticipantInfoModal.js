// @flow

import React from 'react';

import styled from 'styled-components';
import { faCopy } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  // $FlowFixMe
  Box,
  IconButton,
  Modal,
  // $FlowFixMe
  Tooltip,
  Typography
} from 'lattice-ui-kit';

import copyToClipboard from '../../../utils/copyToClipboard';
import { useHasQuestionnairesModule } from '../../shared/hooks';
import { getParticipantLoginLink, getTimeUseDiaryLink } from '../utils';

const Grid = styled.div`
  align-items: center;
  display: grid;
  grid-gap: 20px;
  grid-template-columns: 1fr auto;
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
      <div>
        {
          participantDetails.map((detail) => (
            <Box mb="20px" maxWidth="600px">
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
            </Box>
          ))
        }
      </div>
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
