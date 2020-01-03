// @flow

import React from 'react';

import styled from 'styled-components';

import { STUDY_LOGIN_ROOT } from '../../../core/edm/constants/DataModelConstants';

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
  participantId :UUID;
  studyId :UUID;
}
const ParticipantInfo = ({ participantId, studyId } :Props) => {
  const enrollmentLink = `${STUDY_LOGIN_ROOT}${studyId}&participantId=${participantId}`;

  const participantDetails = [
    { name: 'Participant ID', value: participantId },
    { name: 'Enrollment Link', value: enrollmentLink }
  ];
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

export default ParticipantInfo;
