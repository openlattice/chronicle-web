// @flow

import React, { useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Constants } from 'lattice';
import { Table } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { v4 as uuid } from 'uuid';
import type { RequestState } from 'redux-reqseq';

import ChangeEnrollment from './components/ChangeEnrollment';
import DeleteParticipantModal from './components/DeleteParticipantModal';
import DownloadParticipantDataModal from './components/DownloadParticipantDataModal';
import ParticipantInfoModal from './components/ParticipantInfoModal';
import ParticipantRow from './components/ParticipantRow';
import TABLE_HEADERS from './utils/tableHeaders';

import ParticipantActionTypes from '../../utils/constants/ParticipantActionTypes';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { resetRequestState } from '../../core/redux/ReduxActions';
import {
  CHANGE_ENROLLMENT_STATUS,
  DELETE_STUDY_PARTICIPANT,
  changeEnrollmentStatus,
  deleteStudyParticipant,
} from '../studies/StudiesActions';

const { OPENLATTICE_ID_FQN } = Constants;

const { PERSON_ID, STATUS, STUDY_ID } = PROPERTY_TYPE_FQNS;

const {
  DELETE,
  DOWNLOAD,
  LINK,
  TOGGLE_ENROLLMENT
} = ParticipantActionTypes;

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
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [participantEntityKeyId, setParticipantEntityKeyId] = useState(uuid());

  const deleteParticipantRS :?RequestState = useRequestState(['studies', DELETE_STUDY_PARTICIPANT]);
  const changeEnrollmentStatusRS :?RequestState = useRequestState(['studies', CHANGE_ENROLLMENT_STATUS]);

  const studyId = study.getIn([STUDY_ID, 0]);

  const handleOnDeleteParticipant = () => {
    dispatch(deleteStudyParticipant({
      participantEntityKeyId,
      participantId: participants.getIn([participantEntityKeyId, PERSON_ID, 0]),
      studyId,
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

  const onCloseDeleteParticipantModal = () => {
    setDeleteModalOpen(false);
  };

  const onClickIcon = (event :SyntheticEvent<HTMLElement>) => {
    const { currentTarget } = event;
    const { dataset } = currentTarget;
    const { actionId, keyId } = dataset;

    setParticipantEntityKeyId(keyId);

    // actions
    if (actionId === LINK) {
      setInfoModalOpen(true);
    }
    else if (actionId === DELETE) {
      openDeleteModal();
    }
    else if (actionId === TOGGLE_ENROLLMENT) {
      openEnrollmentModel();
    }
    else if (actionId === DOWNLOAD) {
      setDownloadModalOpen(true);
    }
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
            headers={TABLE_HEADERS}
            paginated
            rowsPerPageOptions={[5, 20, 50]} />
      </TableWrapper>

      <ParticipantInfoModal
          handleOnClose={() => setInfoModalOpen(false)}
          isVisible={infoModalOpen}
          participantId={participants.getIn([participantEntityKeyId, PERSON_ID, 0])}
          studyId={studyId} />

      <DeleteParticipantModal
          handleOnClose={onCloseDeleteParticipantModal}
          handleOnDeleteParticipant={handleOnDeleteParticipant}
          isVisible={deleteModalOpen}
          participantId={participants.getIn([participantEntityKeyId, PERSON_ID, 0])}
          requestState={deleteParticipantRS} />

      <ChangeEnrollment
          enrollmentStatus={participants.getIn([participantEntityKeyId, STATUS, 0])}
          handleOnChangeEnrollment={handleOnChangeEnrollment}
          handleOnClose={() => setEnrollmentModalOpen(false)}
          isVisible={enrollmentModalOpen}
          participantId={participants.getIn([participantEntityKeyId, PERSON_ID, 0])}
          requestState={changeEnrollmentStatusRS} />

      <DownloadParticipantDataModal
          handleOnClose={() => setDownloadModalOpen(false)}
          isVisible={downloadModalOpen}
          participantEntityKeyId={participantEntityKeyId}
          participantId={participants.getIn([participantEntityKeyId, PERSON_ID, 0])}
          studyEntityKeyId={study.getIn([OPENLATTICE_ID_FQN, 0])}
          studyId={studyId} />
    </>
  );
};

export default ParticipantsTable;
