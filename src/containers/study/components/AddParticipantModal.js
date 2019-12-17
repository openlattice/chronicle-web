// @flow

import React, { useRef } from 'react';

import styled from 'styled-components';
import { ActionModal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AddParticipantForm from './AddParticipantForm';

import { ADD_PARTICIPANT } from '../StudyActions';

type Props = {
  requestStates:{
    ADD_PARTICIPANT :RequestState;
  };
  isVisible :boolean;
  onCloseModal :() => void;
  study :string; // needs to be UUID?
};

const ModalBodyWrapper = styled.div`
  min-width: 440px;
`;

const AddParticipantModal = (props :Props) => {
  const {
    isVisible,
    study,
    onCloseModal,
    requestStates
  } = props;

  const formRef = useRef();

  const requestStateComponents = {
    [RequestStates.STANDBY]: (
      <ModalBodyWrapper>
        <AddParticipantForm ref={formRef} study={study} />
      </ModalBodyWrapper>
    ),
    [RequestStates.FAILURE]: (
      <ModalBodyWrapper>
        <span> Failed to add participant. Please try again. </span>
      </ModalBodyWrapper>
    )
  };

  const handleOnSubmit = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClickPrimary={handleOnSubmit}
        onClose={onCloseModal}
        requestState={requestStates[ADD_PARTICIPANT]}
        requestStateComponents={requestStateComponents}
        shouldCloseOnEscape={false}
        shouldCloseOnOutsideClick={false}
        textPrimary="Submit"
        textSecondary="Cancel"
        textTitle="Add Participant" />
  );
};

const mapStateToProps = (state) => ({
  requestStates: {
    [ADD_PARTICIPANT]: state.getIn(['study', ADD_PARTICIPANT, 'requestState'])
  }
});

// $FlowFixMe
export default connect(mapStateToProps)(AddParticipantModal);
