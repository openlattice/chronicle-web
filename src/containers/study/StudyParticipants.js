/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { faPlus } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { Constants } from 'lattice';
import {
  Button,
  Card,
  CardSegment,
  SearchInput,
  Spinner,
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AddParticipantModal from './components/AddParticipantModal';
import ParticipantsTable from './ParticipantsTable';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { resetRequestState } from '../../core/redux/ReduxActions';
import { ADD_PARTICIPANT, GET_STUDY_PARTICIPANTS, getStudyParticipants } from '../studies/StudiesActions';

const { PERSON_ID, STUDY_ID } = PROPERTY_TYPE_FQNS;
const { OPENLATTICE_ID_FQN } = Constants;

const AddParticipantsButton = styled(Button)`
  align-self: flex-start;
  margin-bottom: 5px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const NoParticipants = styled.div`
  margin-top: 20px;
  text-align: ${(props) => props.textAlign};
`;

type Props = {
  study :Map,
};

const StudyParticipants = ({ study } :Props) => {
  const dispatch = useDispatch();

  const [isModalOpen, setModalOpen] = useState(false);
  const [filteredParticipants, setFilteredParticipants] = useState(Map());

  const studyId :UUID = study.getIn([STUDY_ID, 0]);
  const participants :Map = useSelector((state) => state.getIn(['studies', 'participants', studyId], Map()));

  const getParticipantsRS :?RequestState = useRequestState(['studies', GET_STUDY_PARTICIPANTS]);

  useEffect(() => {
    // This is useful for avoiding a network request if
    // a cached value is already available.
    if (participants.isEmpty()) {
      dispatch(getStudyParticipants({
        studyEKID: study.getIn([OPENLATTICE_ID_FQN, 0]),
        studyId: study.getIn([STUDY_ID, 0])
      }));
    }
  }, [dispatch, participants, study]);

  useEffect(() => {
    setFilteredParticipants(participants);
  }, [participants]);

  const openAddParticipantModal = () => {
    dispatch(resetRequestState(ADD_PARTICIPANT));
    setModalOpen(true);
  };

  const handleOnChange = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const { currentTarget } = event;
    const { value } = currentTarget;

    const matchingResults = participants
      .filter((participant) => participant.getIn([PERSON_ID, 0]).toLowerCase().includes(value.toLowerCase()));
    setFilteredParticipants(matchingResults);
  };

  if (getParticipantsRS === RequestStates.PENDING) {
    return (
      <Spinner size="2x" />
    );
  }

  return (
    <Card>
      <CardSegment vertical>
        <CardHeader>
          <SearchInput placeholder="Filter..." onChange={handleOnChange} width="250px" />
          <AddParticipantsButton
              onClick={openAddParticipantModal}
              color="primary"
              startIcon={<FontAwesomeIcon icon={faPlus} />}>
            Add Participant
          </AddParticipantsButton>
        </CardHeader>
        {
          !participants.isEmpty()
          && filteredParticipants.isEmpty()
          && <NoParticipants textAlign="start"> No matching results. </NoParticipants>
        }
        {
          participants.isEmpty()
          && <NoParticipants textAlign="center"> No participants found! </NoParticipants>
        }
        {
          !filteredParticipants.isEmpty()
          && <ParticipantsTable participants={filteredParticipants} study={study} />
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

export default StudyParticipants;
