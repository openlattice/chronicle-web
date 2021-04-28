// @flow

import React, { useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Input,
  Label,
  Modal,
  Spinner,
  Typography,
} from 'lattice-ui-kit';
import { DataUtils } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { deleteStudy } from '../../studies/StudiesActions';

const { FULL_NAME_FQN } = PROPERTY_TYPE_FQNS;

const { getPropertyValue } = DataUtils;

const ModalBodyWrapper = styled.div`
  max-width: 500px;
`;

const CenterText = styled.div`
  text-align: center;
`;

const DeleteStudyModal = ({
  isVisible,
  onClose,
  requestState,
  study
} :{|
  isVisible :boolean;
  onClose :() => void;
  requestState :RequestState;
  study :Map
|}) => {
  const dispatch = useDispatch();

  const [studyName, setStudyName] = useState('');
  const [isInputError, setInputError] = useState(false);

  const handleOnChange = (event :SyntheticInputEvent<HTMLInputElement>) => {
    const { currentTarget } = event;
    const { value } = currentTarget;
    setStudyName(value);
  };

  const handleOnDelete = () => {
    if (studyName === getPropertyValue(study, [FULL_NAME_FQN, 0])) {
      setInputError(false);
      dispatch(deleteStudy(study));
    }
    else {
      setInputError(true);
    }
  };

  const requestStateComponents = {
    [RequestStates.STANDBY]: (
      <div>
        <Typography gutterBottom>
          Are you sure you want to delete study?
        </Typography>

        <Label htmlFor="studyName">
          To confirm, please type the name of study.
        </Label>
        <Input
            error={isInputError}
            id="studyName"
            onChange={handleOnChange}
            value={studyName} />
      </div>
    ),
    [RequestStates.FAILURE]: (
      <Typography>
        Sorry, could not delete study. Please try again or contact support@openlattice.com.
      </Typography>
    ),
    [RequestStates.PENDING]: (
      <CenterText>
        <Spinner size="2x" />
        <Typography>
          Deleting study. Please wait.
        </Typography>
      </CenterText>
    ),
    [RequestStates.SUCCESS]: (
      <Typography>
        Your request to delete study has been successfully submitted.
      </Typography>
    )
  };

  const textPrimary = requestState === RequestStates.PENDING || requestState === RequestStates.STANDBY ? 'Delete' : '';

  return (
    <Modal
        isVisible={isVisible}
        onClickPrimary={handleOnDelete}
        onClose={onClose}
        shouldCloseOnEscape={false}
        shouldCloseOnOutsideClick={false}
        textPrimary={textPrimary}
        textSecondary="Close"
        textTitle="Delete Study">
      <ModalBodyWrapper>
        { requestStateComponents[requestState] }
      </ModalBodyWrapper>
    </Modal>
  );
};

export default DeleteStudyModal;
