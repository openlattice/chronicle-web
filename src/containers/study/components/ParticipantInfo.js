// @flow

import React from 'react';

import styled from 'styled-components';
import { Colors } from 'lattice-ui-kit';

const { NEUTRALS } = Colors;

const ModalWrapper = styled.div`
  width: 500px;
`;

const InfoWrapper = styled.div`
  margin-bottom: 20px;

  > h4 {
    color: ${NEUTRALS[1]};
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 1.8px;
    margin: 5px 0;
    padding: 0;
    text-transform: uppercase;
  }

  > p {
    font-size: 15px;
    margin: 5px 0;
    padding: 0;
  }
`;

type Props = {
  participantId :any;
  studyId :string;
}
const ParticipantInfo = ({ participantId, studyId } :Props) => {
  const rootUrl = 'https://openlattice.com/chronicle/login?studyId=';
  const enrollmentLink = `${rootUrl}${studyId}&participantId=${participantId}`;

  return (
    <ModalWrapper>
      <InfoWrapper>
        <h4> Participant ID</h4>
        <p>
          { participantId }
        </p>
      </InfoWrapper>

      <InfoWrapper>
        <h4> Study Id </h4>
        <p>
          { studyId }
        </p>
      </InfoWrapper>

      <InfoWrapper>
        <h4> Enrollment Link </h4>
        <p>
          { enrollmentLink }
        </p>
      </InfoWrapper>
    </ModalWrapper>
  );
};

export default ParticipantInfo;
