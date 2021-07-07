/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { faPlus } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import {
  // $FlowFixMe
  Box,
  Button,
  Card,
  CardSegment,
  // $FlowFixMe
  Grid,
  SearchInput,
} from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';

import AddParticipantModal from './components/AddParticipantModal';
import ParticipantsTable from './ParticipantsTable';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { resetRequestState } from '../../core/redux/ReduxActions';
import { ADD_PARTICIPANT } from '../studies/StudiesActions';

const { PERSON_ID } = PROPERTY_TYPE_FQNS;

const AddParticipantsButton = styled(Button)`
  align-self: flex-start;
  margin-bottom: 5px;
`;

type Props = {
  hasDeletePermission :Boolean;
  participants :Map;
  study :Map;
};

const StudyParticipants = ({ hasDeletePermission, participants, study } :Props) => {
  const dispatch = useDispatch();

  const [isModalOpen, setModalOpen] = useState(false);
  const [filteredParticipants, setFilteredParticipants] = useState(Map());

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

  return (
    <Card>
      <CardSegment vertical>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={9}>
            <SearchInput placeholder="Filter participants" onChange={handleOnChange} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AddParticipantsButton
                fullWidth
                onClick={openAddParticipantModal}
                color="primary"
                startIcon={<FontAwesomeIcon icon={faPlus} />}>
              Add Participant
            </AddParticipantsButton>
          </Grid>
        </Grid>
        {
          !participants.isEmpty()
          && filteredParticipants.isEmpty()
          && <Box mt={3} textAlign="left"> No matching results. </Box>
        }
        {
          participants.isEmpty()
          && <Box mt={3} align="center"> No participants found! </Box>
        }
        {
          !filteredParticipants.isEmpty()
          && (
            <ParticipantsTable
                hasDeletePermission={hasDeletePermission}
                participants={filteredParticipants}
                study={study} />
          )
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
