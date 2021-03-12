/*
 * @flow
 */
import React, { useRef } from 'react';

import { Map } from 'immutable';
import { ActionModal } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import CreateStudyForm from './CreateStudyForm';

import { CREATE_STUDY, UPDATE_STUDY } from '../StudiesActions';

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
      <div>
        <CreateStudyForm ref={formRef} study={study} notificationsEnabled={notificationsEnabled} />
      </div>
    ),
    [RequestStates.FAILURE]: (
      <div>
        {
          study
            ? <span> Failed to update study. Please try again. </span>
            : <span> Failed to create a new study. Please try again. </span>
        }
      </div>
    ),
    [RequestStates.SUCCESS]: (
      <div>
        {
          study
            ? <span> Successfully updated study. </span>
            : <span> Successfully created a new study. </span>
        }
      </div>
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
