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
import { DELETE_STUDY_PARTICIPANT, deleteStudyParticipant } from '../studies/StudiesActions';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { PERSON_ID } = PROPERTY_TYPE_FQNS;
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
      width: '175px',
      textAlign: 'center'
    },
    key: 'actions',
    label: 'Actions',
    sortable: false
  },
];

const ModalWrapper = styled.div`
  width: 500px;
`;

const TableWrapper = styled.div`
  margin-top: 20px;
`;

type Props = {
  participants :Map<UUID, Map>;
  studyId :string;
};

const ParticipantsTable = (props :Props) => {
  const { participants, studyId } = props;

  const dispatch = useDispatch();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [participantEntityKeyId, setParticipantEntityKeyId] = useState(null);
  const requestStates = {
    [DELETE_STUDY_PARTICIPANT]: useSelector((state) => state.getIn(['studies', DELETE_STUDY_PARTICIPANT]))
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
        textTitle="PARTICIPANT INFO">
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
        <span>? This action cannot be undone. </span>
      </ModalWrapper>
    ),
    [RequestStates.FAILURE]: (
      <span> Failed to delete participant. Please try again. </span>
    ),
    [RequestStates.SUCCESS]: (
      <ModalWrapper>
        <span> Successfully deleted participant &apos </span>
        <span style={{ color: NEUTRALS[0], fontWeight: 500 }}>
          { participants.getIn([participantEntityKeyId, PERSON_ID, 0]) }
          &apos;
        </span>
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
        textTitle="DELETE PARTICIPANT" />
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
