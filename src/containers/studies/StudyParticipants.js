/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { List } from 'immutable';
import {
  Banner,
  Button,
  Card,
  CardSegment
} from 'lattice-ui-kit';

import AddParticipantModal from './components/AddParticipantModal';

import ParticipantsTable from './components/ParticipantsTable';

const Container = styled.div`
  margin-top: 50px;
  display: flex;
  flex-direction: column;
`;

const AddParticipantsButton = styled(Button)`
  align-self: flex-end;
`;
type Props = {
  studyId :string,
  // participants :List;
};

const MissingParticipants = () => (
  <Banner isOpen> No participants found! </Banner>
);

const StudyParticipants = ({ studyId } :Props) => {
  const [isModalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    // here we dispatch an action to fetch the study Participants
  });

  const participants = List(['sample id', 'king lafonce']);
  participants.set('here is a sample id');

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
            studyId={studyId} />
      </Card>
    </Container>
  );
};

// need to get all the participants
export default StudyParticipants;
