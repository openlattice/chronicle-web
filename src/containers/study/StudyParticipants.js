/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Banner,
  Card,
  CardSegment,
  PlusButton,
  Spinner
} from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';

import AddParticipantModal from './components/AddParticipantModal';
import ParticipantsTable from './ParticipantsTable';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { resetRequestState } from '../../core/redux/ReduxActions';
import { ADD_PARTICIPANT, GET_STUDY_PARTICIPANTS, getStudyParticipants } from '../studies/StudiesActions';

const { STUDY_ID } = PROPERTY_TYPE_FQNS;

const AddParticipantsButton = styled(PlusButton)`
  align-self: flex-start;
  margin-bottom: 5px;
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

  const studyId :UUID = study.getIn([STUDY_ID, 0]);
  const participants :Map = useSelector((state) => state.getIn(['studies', 'participants', studyId], Map()));

  useEffect(() => {
    // This is useful for avoiding a network request if
    // a cached value is already available.
    if (participants.isEmpty()) {
      dispatch(getStudyParticipants(studyId));
    }
  }, [dispatch, participants, studyId]);

  const requestStates = {
    [GET_STUDY_PARTICIPANTS]: useSelector((state) => state.getIn(['studies', GET_STUDY_PARTICIPANTS, 'requestState'])),
  };

  const openAddParticipantModal = () => {
    dispatch(resetRequestState(ADD_PARTICIPANT));
    setModalOpen(true);
  };

  if (requestStates[GET_STUDY_PARTICIPANTS] === RequestStates.PENDING) {
    return (
      <Spinner size="2x" />
    );
  }

  return (
    <Card>
      <CardSegment vertical>
        <AddParticipantsButton
            onClick={openAddParticipantModal}
            mode="primary">
          Add Participant
        </AddParticipantsButton>
        {
          participants.isEmpty()
            ? <MissingParticipants />
            : <ParticipantsTable participants={participants} study={study} />
        }
      </CardSegment>
      <AddParticipantModal
          isVisible={isModalOpen}
          onCloseModal={() => setModalOpen(false)}
          participants={participants}
          study={study} />
    </Card>
  );
};

// need to get all the participants
export default StudyParticipants;
