// @flow

import React, { useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Constants } from 'lattice';
import {
  ActionModal,
  Colors,
  Modal,
  Table
} from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';

import ParticipantInfo from './components/ParticipantInfo';
import ParticipantRow from './components/ParticipantRow';

import { PARTICIPANT_ACTIONS } from '../../core/edm/constants/DataModelConstants';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { DELETE_STUDY_PARTICIPANT, changeEnrollmentStatus, deleteStudyParticipant } from '../studies/StudiesActions';

const { PERSON_ID, STATUS, STUDY_ID } = PROPERTY_TYPE_FQNS;
const { NEUTRALS } = Colors;
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

const ModalWrapper = styled.div`
  width: 500px;
  font-weight: 300;
`;

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
  const [participantEntityKeyId, setParticipantEntityKeyId] = useState(null);

  const studyId = study.getIn([STUDY_ID, 0]);

  const requestStates = {
    [DELETE_STUDY_PARTICIPANT]:
      useSelector((state) => state.getIn(['studies', DELETE_STUDY_PARTICIPANT, 'requestState']))
  };

  const handleDeleteParticipant = () => {
    dispatch(deleteStudyParticipant({
      participantEntityKeyId,
      studyId
    }));
    // entity key Id
  };

  const renderInfoModal = () => (
    <Modal
        isVisible={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        textSecondary="Close"
        textTitle="Participant Info">
      <ParticipantInfo participantId={participants.getIn([participantEntityKeyId, PERSON_ID, 0])} studyId={studyId} />
    </Modal>
  );

  const requestStateComponents = {
    [RequestStates.STANDBY]: (
      <ModalWrapper>
        <span> Are you sure you want to delete participant &apos;</span>
        <span style={{ color: NEUTRALS[0], fontWeight: 500 }}>
          { participants.getIn([participantEntityKeyId, PERSON_ID, 0]) }
          &apos;
        </span>
        <span>?</span>
      </ModalWrapper>
    ),
    [RequestStates.FAILURE]: (
      <span> Failed to delete participant. Please try again. </span>
    ),
    [RequestStates.SUCCESS]: (
      <ModalWrapper>
        <span> Successfully deleted participant. </span>
      </ModalWrapper>
    )
  };

  const renderDeleteModal = () => (
    <ActionModal
        isVisible={deleteModalOpen}
        onClickPrimary={handleDeleteParticipant}
        onClose={() => setDeleteModalOpen(false)}
        requestState={requestStates[DELETE_STUDY_PARTICIPANT]}
        requestStateComponents={requestStateComponents}
        shouldCloseOnEscape={false}
        shouldCloseOnOutsideClick={false}
        textPrimary="Yes, Delete"
        textSecondary="No, Cancel"
        textTitle="Delete Participant" />
  );

  const onClickIcon = (event :SyntheticEvent<HTMLElement>) => {
    const { currentTarget } = event;
    const { dataset } = currentTarget;
    const { actionId } = dataset;
    const { keyId } = dataset;

    setParticipantEntityKeyId(keyId);
    // actions
    if (actionId === LINK) setInfoModalOpen(true);
    if (actionId === DELETE) setDeleteModalOpen(true);
    if (actionId === TOGGLE_ENROLLMENT) {
      dispatch(changeEnrollmentStatus({
        enrollmentStatus: participants.getIn([keyId, STATUS, 0]),
        studyEntityKeyId: study.getIn([OPENLATTICE_ID_FQN, 0]),
        studyId,
        participantEntityKeyId: keyId,
      }));
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
            headers={tableHeader}
            paginated
            rowsPerPageOptions={[5, 20, 50]} />
      </TableWrapper>
      {renderInfoModal()}
      {renderDeleteModal()}
    </>
  );
};

export default ParticipantsTable;
