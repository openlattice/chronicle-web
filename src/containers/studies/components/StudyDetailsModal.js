/*
 * @flow
 */
import React, { useRef } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { ActionModal } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import CreateStudyForm from './CreateStudyForm';

import { CREATE_STUDY, UPDATE_STUDY } from '../StudiesActions';

type Props = {
  editMode :boolean;
  handleOnCloseModal :() => void;
  isVisible :boolean;
  requestStates :{
    CREATE_STUDY :RequestState,
    UPDATE_STUDY :RequestState
  };
  study :Map;
};

const ModalBodyWrapper = styled.div`
  min-width: 440px;
`;

const StudyDetailsModal = (props :Props) => {
  const formRef = useRef();

  const {
    editMode,
    handleOnCloseModal,
    isVisible,
    requestStates,
    study
  } = props;

  const handleOnSubmit = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const requestStateComponents = {
    [RequestStates.STANDBY]: (
      <ModalBodyWrapper>
        <CreateStudyForm editMode={editMode} ref={formRef} study={study} />
      </ModalBodyWrapper>
    ),
    [RequestStates.FAILURE]: (
      <ModalBodyWrapper>
        {
          editMode
            ? <span> Failed to update study. Please try again. </span>
            : <span> Failed to create a new study. Please try again. </span>
        }
      </ModalBodyWrapper>
    ),
    [RequestStates.SUCCESS]: (
      <ModalBodyWrapper>
        {
          editMode
            ? <span> Successfully updated study. </span>
            : <span> Successfully created a new study. </span>
        }
      </ModalBodyWrapper>
    )
  };

  const textTitle = editMode ? 'Edit Study ' : 'Create Study';
  const textPrimary = editMode ? 'Save Changes' : 'Submit';
  const requestState = editMode ? requestStates[UPDATE_STUDY] : requestStates[CREATE_STUDY];

  return (
    <ActionModal
        isVisible={isVisible}
        onClose={handleOnCloseModal}
        requestState={requestState}
        requestStateComponents={requestStateComponents}
        onClickPrimary={handleOnSubmit}
        shouldCloseOnEscape={false}
        shouldCloseOnOutsideClick={false}
        textPrimary={textPrimary}
        textSecondary="Cancel"
        textTitle={textTitle} />
  );
};

const mapStateToProps = (state :Map) => ({
  requestStates: {
    [CREATE_STUDY]: state.getIn(['studies', CREATE_STUDY, 'requestState']),
    [UPDATE_STUDY]: state.getIn(['studies', UPDATE_STUDY, 'requestState'])
  },
});

// $FlowFixMe
export default connect(mapStateToProps)(StudyDetailsModal);
