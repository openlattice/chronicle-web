/*
 * @flow
 */
import React, { useRef } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { ActionModal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import CreateStudyForm from './CreateStudyForm';

import { CREATE_STUDY } from '../StudiesActions';

type Props = {
  actions :{
    resetRequestState :RequestSequence
  };
  handleOnCloseModal :() => void;
  isVisible :boolean;
  requestStates :{
    CREATE_STUDY :RequestState
  };
};

const ModalBodyWrapper = styled.div`
  min-width: 440px;
`;

const CreateStudyModal = (props :Props) => {
  const formRef = useRef();

  const {
    isVisible,
    handleOnCloseModal,
    requestStates
  } = props;

  const handleOnSubmit = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const requestStateComponents = {
    [RequestStates.STANDBY]: (
      <ModalBodyWrapper>
        <CreateStudyForm ref={formRef} />
      </ModalBodyWrapper>
    ),
    [RequestStates.FAILURE]: (
      <ModalBodyWrapper>
        <span> Failed to create a new study. Please try again. </span>
      </ModalBodyWrapper>
    ),
    [RequestStates.SUCCESS]: (
      <ModalBodyWrapper>
        <span> Successfully created a new study. </span>
      </ModalBodyWrapper>
    )
  };

  return (
    <ActionModal
        isVisible={isVisible}
        onClose={handleOnCloseModal}
        requestState={requestStates[CREATE_STUDY]}
        requestStateComponents={requestStateComponents}
        onClickPrimary={handleOnSubmit}
        shouldCloseOnEscape={false}
        shouldCloseOnOutsideClick={false}
        textPrimary="Create"
        textSecondary="Cancel"
        textTitle="Create Study" />
  );
};

const mapStateToProps = (state :Map) => ({
  requestStates: {
    [CREATE_STUDY]: state.getIn(['studies', CREATE_STUDY, 'requestState'])
  },
});

// $FlowFixMe
export default connect(mapStateToProps)(CreateStudyModal);
