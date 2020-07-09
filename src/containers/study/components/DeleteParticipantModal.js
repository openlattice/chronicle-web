// @flow

import React from 'react';

import styled from 'styled-components';
import { ActionModal, Colors } from 'lattice-ui-kit';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

const { NEUTRAL } = Colors;

const ModalWrapper = styled.div`
  width: 500px;
`;

type Props = {
  handleOnClose :() => void;
  handleOnDeleteParticipant :() => void;
  isVisible :boolean;
  participantId :UUID;
  requestState :RequestState;
}
const DeleteParticipantModal = ({
  handleOnClose,
  handleOnDeleteParticipant,
  isVisible,
  participantId,
  requestState
} :Props) => {

  const requestStateComponents = {
    [RequestStates.STANDBY]: (
      <ModalWrapper>
        <span> Are you sure you want to delete </span>
        <span style={{ color: NEUTRAL.N900, fontWeight: 500 }}>
          { participantId }
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
  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnDeleteParticipant}
        onClose={handleOnClose}
        requestState={requestState}
        requestStateComponents={requestStateComponents}
        shouldCloseOnEscape={false}
        shouldCloseOnOutsideClick={false}
        textPrimary="Yes"
        textSecondary="No"
        textTitle="Delete Participant" />
  );
};
export default DeleteParticipantModal;
