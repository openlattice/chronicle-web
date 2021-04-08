// @flow

import React from 'react';

import {
  Input,
  Label,
  Modal,
  Typography,
} from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

const DeleteStudyModal = ({
  isVisible,
  onClose,
  requestState,
} :{|
  isVisible :boolean;
  onClose :() => void;
  requestState :RequestState
|}) => {
  const dispatch = useDispatch();

  const requestStateComponents = {
    [RequestStates.STANDBY]: (
      <div>
        <Typography gutterBottom>
          Are you sure you want to delete this study?
        </Typography>

        <Label htmlFor="studyName">
          To confirm, please type the name of study.
        </Label>
        <Input
            id="studyName" />
      </div>
    ),
    [RequestStates.FAILURE]: (
      <Typography>
        Sorry, could not delete study. Please try again or contact support@openlattice.com.
      </Typography>
    ),
    [RequestStates.PENDING]: (
      <Typography>

      </Typography>
    )
  };

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textTitle="Delete Study">
      <div>
        { requestStateComponents[requestState] }
      </div>
    </Modal>
  );
};
