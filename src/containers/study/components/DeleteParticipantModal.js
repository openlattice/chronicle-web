// @flow

import React from 'react';

import {
  // $FlowFixMe
  Box,
  Modal,
  ModalFooter,
  Spinner,
  Typography
} from 'lattice-ui-kit';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

type Props = {
  handleOnClose :() => void;
  handleOnDeleteParticipant :() => void;
  isVisible :boolean;
  participantId :UUID;
  requestState :?RequestState;
}
const DeleteParticipantModal = ({
  handleOnClose,
  handleOnDeleteParticipant,
  isVisible,
  participantId,
  requestState
} :Props) => {

  const textPrimary = 'Delete';
  const textSecondary = 'Cancel';

  const requestStateComponents = {
    [RequestStates.STANDBY]: (
      <Typography>
        {`Are you sure you want to delete ${participantId}'s data? This action is permanent and cannot be undone.`}
      </Typography>
    ),
    [RequestStates.PENDING]: (
      <Box textAlign="center">
        <Spinner size="2x" />
        <Typography>Deleting participant&apos;s data. Please wait.</Typography>
      </Box>
    ),
    [RequestStates.FAILURE]: (
      <Typography>
        Failed to delete participant. Please try again or contact support@openlattice.com.
      </Typography>
    ),
    [RequestStates.SUCCESS]: (
      <Typography>
        Your request to delete participant&apos;s data has been successfully submitted.
      </Typography>
    )
  };

  const renderFooter = () => {
    if (requestState === RequestStates.PENDING) {
      return (
        <ModalFooter
            isPendingPrimary
            onClickSecondary={handleOnClose}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            withFooter />
      );
    }
    if (requestState === RequestStates.SUCCESS || requestState === RequestStates.FAILURE) {
      return (
        <ModalFooter
            onClickPrimary={handleOnClose}
            textPrimary="Close"
            textSecondary="" />
      );
    }
    return (
      <ModalFooter
          onClickPrimary={handleOnDeleteParticipant}
          onClickSecondary={handleOnClose}
          textPrimary={textPrimary}
          textSecondary={textSecondary} />
    );
  };

  return (
    <Modal
        isVisible={isVisible}
        onClose={handleOnClose}
        requestState={requestState}
        shouldCloseOnEscape={false}
        shouldCloseOnOutsideClick={false}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        textTitle="Delete Participant's Data"
        withFooter={renderFooter}>
      <Box maxWidth="500px">
        {
          requestStateComponents[requestState || RequestStates.STANDBY]
        }
      </Box>
    </Modal>
  );
};

export default DeleteParticipantModal;
