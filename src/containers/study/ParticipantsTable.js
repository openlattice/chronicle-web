// @flow

import React, { useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Constants } from 'lattice';
import { Table } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';

import ChangeEnrollment from './components/ChangeEnrollment';
import DeleteParticipantModal from './components/DeleteParticipantModal';
import ParticipantInfoModal from './components/ParticipantInfoModal';
import ParticipantRow from './components/ParticipantRow';
import { resetRequestState } from '../../core/redux/ReduxActions';
import { PARTICIPANT_ACTIONS } from '../../core/edm/constants/DataModelConstants';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import {
  CHANGE_ENROLLMENT_STATUS,
  DELETE_STUDY_PARTICIPANT,
  changeEnrollmentStatus,
  deleteStudyParticipant
} from '../studies/StudiesActions';

const { PERSON_ID, STATUS, STUDY_ID } = PROPERTY_TYPE_FQNS;
const { OPENLATTICE_ID_FQN } = Constants;
const {
  DELETE,
  DOWNLOAD,
  LINK,
  TOGGLE_ENROLLMENT
} = PARTICIPANT_ACTIONS;

const tableHeader = [
  {
    key: 'id',
    label: 'Participant ID',
  },
  {
    cellStyle: {
      textAlign: 'center',
      width: '175px',
    },
    key: 'actions',
    label: 'Actions',
    sortable: false
  },
];

const TableWrapper = styled.div`
  margin-top: 20px;
`;

type Props = {
  participants :Map<UUID, Map>;
  study :Map;
};

const ParticipantsTable = (props :Props) => {
  const { participants, study } = props;

  const dispatch = useDispatch();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [enrollmentModalOpen, setEnrollmentModalOpen] = useState(false);
  const [participantEntityKeyId, setParticipantEntityKeyId] = useState(null);

  const studyId = study.getIn([STUDY_ID, 0]);

  const requestStates = {
    [DELETE_STUDY_PARTICIPANT]:
      useSelector((state) => state.getIn(['studies', DELETE_STUDY_PARTICIPANT, 'requestState'])),
    [CHANGE_ENROLLMENT_STATUS]:
      useSelector((state) => state.getIn(['studies', CHANGE_ENROLLMENT_STATUS, 'requestState']))
  };

  const handleOnDeleteParticipant = () => {
    dispatch(deleteStudyParticipant({
      participantEntityKeyId,
      studyId
    }));
  };

  const openDeleteModal = () => {
    dispatch(resetRequestState(DELETE_STUDY_PARTICIPANT));
    setDeleteModalOpen(true);
  };

  const openEnrollmentModel = () => {
    dispatch(resetRequestState(CHANGE_ENROLLMENT_STATUS));
    setEnrollmentModalOpen(true);
  };

  const handleOnChangeEnrollment = () => {
    dispatch(changeEnrollmentStatus({
      enrollmentStatus: participants.getIn([participantEntityKeyId, STATUS, 0]),
      participantEntityKeyId,
      studyId,
    }));
  };

  const onClickIcon = (event :SyntheticEvent<HTMLElement>) => {
    const { currentTarget } = event;
    const { dataset } = currentTarget;
    const { actionId } = dataset;
    const { keyId } = dataset;

    setParticipantEntityKeyId(keyId);

    // actions
    if (actionId === LINK) setInfoModalOpen(true);
    if (actionId === DELETE) openDeleteModal();
    if (actionId === TOGGLE_ENROLLMENT) openEnrollmentModel();

  };

  const components = {
    Row: ({ data: rowData } :any) => (
      <ParticipantRow data={rowData} onClickIcon={onClickIcon} />
    )
  };

  return (
    <>
      <TableWrapper>
        <Table
            components={components}
            data={participants.valueSeq().toJS()}
            headers={tableHeader}
            paginated
            rowsPerPageOptions={[5, 20, 50]} />
      </TableWrapper>
      <ParticipantInfoModal
          handleOnClose={() => setInfoModalOpen(false)}
          isVisible={infoModalOpen}
          participantId={participants.getIn([participantEntityKeyId, PERSON_ID, 0])}
          studyId={studyId} />
      <DeleteParticipantModal
          handleOnClose={() => setDeleteModalOpen(false)}
          handleOnDeleteParticipant={() => handleOnDeleteParticipant()}
          isVisible={deleteModalOpen}
          participantId={participants.getIn([participantEntityKeyId, PERSON_ID, 0])}
          requestState={requestStates[DELETE_STUDY_PARTICIPANT]} />

      <ChangeEnrollment
          enrollmentStatus={participants.getIn([participantEntityKeyId, STATUS, 0])}
          handleOnChangeEnrollment={() => handleOnChangeEnrollment()}
          handleOnClose={() => setEnrollmentModalOpen(false)}
          isVisible={enrollmentModalOpen}
          participantId={participants.getIn([participantEntityKeyId, PERSON_ID, 0])}
          requestState={requestStates[CHANGE_ENROLLMENT_STATUS]} />
    </>
  );
};

export default ParticipantsTable;
