/*
 * @flow
 */
import React, { useRef } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { ActionModal } from 'lattice-ui-kit';
import { ReduxConstants } from 'lattice-utils';
import { connect } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import CreateStudyForm from './CreateStudyForm';

import { CREATE_STUDY, UPDATE_STUDY } from '../StudiesActions';

const { REQUEST_STATE } = ReduxConstants;

type Props = {
  handleOnCloseModal :() => void;
  isVisible :boolean;
  notificationsEnabled :boolean;
  requestStates :{
    CREATE_STUDY :RequestState,
    UPDATE_STUDY :RequestState
  };
  study :Map;
};

const ModalBodyWrapper = styled.div`
  min-width: 500px;
`;

const StudyDetailsModal = (props :Props) => {
  const formRef = useRef();

  const {
    handleOnCloseModal,
    isVisible,
    notificationsEnabled,
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
        <CreateStudyForm ref={formRef} study={study} notificationsEnabled={notificationsEnabled} />
      </ModalBodyWrapper>
    ),
    [RequestStates.FAILURE]: (
      <ModalBodyWrapper>
        {
          study
            ? <span> Failed to update study. Please try again. </span>
            : <span> Failed to create a new study. Please try again. </span>
        }
      </ModalBodyWrapper>
    ),
    [RequestStates.SUCCESS]: (
      <ModalBodyWrapper>
        {
          study
            ? <span> Successfully updated study. </span>
            : <span> Successfully created a new study. </span>
        }
      </ModalBodyWrapper>
    )
  };

  const textTitle = study ? 'Edit Study ' : 'Create Study';
  const textPrimary = study ? 'Save Changes' : 'Submit';
  const requestState = study ? requestStates[UPDATE_STUDY] : requestStates[CREATE_STUDY];

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
    [CREATE_STUDY]: state.getIn(['studies', CREATE_STUDY, REQUEST_STATE]),
    [UPDATE_STUDY]: state.getIn(['studies', UPDATE_STUDY, REQUEST_STATE])
  },
});

// $FlowFixMe
export default connect(mapStateToProps)(StudyDetailsModal);
