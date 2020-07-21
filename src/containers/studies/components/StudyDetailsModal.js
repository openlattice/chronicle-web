/*
 * @flow
 */
import React, { useRef } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { ActionModal } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import CreateStudyForm from './CreateStudyForm';

import { CREATE_STUDY, UPDATE_STUDY } from '../StudiesActions';

const ModalBodyWrapper = styled.div`
  min-width: 500px;
`;

type Props = {
  handleOnCloseModal :() => void;
  isVisible :boolean;
  notificationsEnabled :boolean;
  study ?:Map;
};

const StudyDetailsModal = (props :Props) => {
  const formRef = useRef();

  const createStudyRS :?RequestState = useRequestState(['studies', CREATE_STUDY]);
  const updateStudyRS :?RequestState = useRequestState(['studies', UPDATE_STUDY]);

  const {
    handleOnCloseModal,
    isVisible,
    notificationsEnabled,
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
  const requestState = study ? updateStudyRS : createStudyRS;

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

StudyDetailsModal.defaultProps = {
  notificationsEnabled: false,
  study: undefined
};

export default StudyDetailsModal;
