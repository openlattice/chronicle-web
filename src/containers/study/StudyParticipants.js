/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Banner,
  Button,
  Card,
  CardSegment
} from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import AddParticipantModal from './components/AddParticipantModal';
import ParticipantsTable from './components/ParticipantsTable';

const { STUDY_ID } = PROPERTY_TYPE_FQNS;

const Container = styled.div`
  margin-top: 50px;
  display: flex;
  flex-direction: column;
`;

const AddParticipantsButton = styled(Button)`
  align-self: flex-end;
`;

type Props = {
  study :Map,
};

const MissingParticipants = () => (
  <Banner isOpen> No participants found! </Banner>
);

const StudyParticipants = ({ study } :Props) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const studyId = study.getIn([STUDY_ID, 0]);
  const participants = useSelector((state) => state.getIn(['study', 'participants', studyId], List()));

  return (
    <Container>
      <Card>
        <CardSegment vertical>
          <AddParticipantsButton
              onClick={() => setModalOpen(true)}
              mode="primary">
            Add Participant
          </AddParticipantsButton>
          {
            participants.count() === 0 ? <MissingParticipants /> : <ParticipantsTable participants={participants} />
          }
        </CardSegment>
        <AddParticipantModal
            isVisible={isModalOpen}
            onCloseModal={() => setModalOpen(false)}
            study={study} />
      </Card>
    </Container>
  );
};

// need to get all the participants
export default StudyParticipants;
