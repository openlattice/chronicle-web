/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Banner,
  Button,
  Card,
  CardSegment,
  Spinner
} from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';

import AddParticipantModal from './components/AddParticipantModal';
import ParticipantsTable from './components/ParticipantsTable';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { GET_STUDY_PARTICIPANTS, getStudyParticipants } from '../studies/StudiesActions';

const { STUDY_ID } = PROPERTY_TYPE_FQNS;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 50px;
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
  const dispatch = useDispatch();
  const [isModalOpen, setModalOpen] = useState(false);

  const studyId = study.getIn([STUDY_ID, 0]);
  const participants = useSelector((state) => state.getIn(['studies', 'participants', studyId], Map()));

  useEffect(() => {
    dispatch(getStudyParticipants(studyId));
  }, [dispatch, studyId]);

  const requestStates = {
    [GET_STUDY_PARTICIPANTS]: useSelector((state) => state.getIn(['sudies', GET_STUDY_PARTICIPANTS, 'requestState']))
  };

  if (requestStates[GET_STUDY_PARTICIPANTS] === RequestStates.PENDING) {
    return (
      <Spinner size="2x" />
    );
  }

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
            participants.isEmpty()
              ? <MissingParticipants />
              : <ParticipantsTable participants={participants} studyId={studyId} />
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
