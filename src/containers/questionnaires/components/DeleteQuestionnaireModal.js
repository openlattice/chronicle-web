// @flow

import React, { useEffect, useState } from 'react';

import { Modal, ModalFooter } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { resetRequestState } from '../../../core/redux/ReduxActions';
import { DELETE_QUESTIONNAIRE, deleteQuestionnaire } from '../../questionnaire/QuestionnaireActions';

type Props = {
  isVisible :boolean;
  onClose :() => void;
  studyEKID :UUID;
  questionnaireEKID :UUID;
};

const DeleteQuestionnaireModal = ({
  isVisible,
  onClose,
  studyEKID,
  questionnaireEKID
} :Props) => {
  const dispatch = useDispatch();

  const [modalContentText, setModalContentText] = useState(
    'Are you sure you want to delete questionnaire? This action cannot be reversed.'
  );

  const deleteQuestionnaireRS :RequestState = useSelector(
    (state) => state.getIn(['questionnaire', DELETE_QUESTIONNAIRE, 'requestState'])
  );

  useEffect(() => {
    if (deleteQuestionnaireRS === RequestStates.FAILURE) {
      setModalContentText('Sorry, an error occurred while attempting to delete questionnaire.');
    }
    if (deleteQuestionnaireRS === RequestStates.SUCCESS) {
      setModalContentText('Questionnaire was successfully deleted.');
    }
  }, [deleteQuestionnaireRS]);

  // reset delete requestState on dismount
  useEffect(() => () => {
    dispatch(resetRequestState(DELETE_QUESTIONNAIRE));
  }, [dispatch]);

  const onConfirmDelete = () => {
    dispatch(deleteQuestionnaire({
      studyEKID, questionnaireEKID
    }));
  };

  const primaryBtnText = deleteQuestionnaireRS === RequestStates.SUCCESS
    ? undefined
    : 'Delete';

  const renderFooter = () => (
    <ModalFooter
        isPendingPrimary={deleteQuestionnaireRS === RequestStates.PENDING}
        onClickPrimary={onConfirmDelete}
        onClickSecondary={onClose}
        textPrimary={primaryBtnText}
        textSecondary="Cancel" />
  );

  return (
    <Modal
        isVisible={isVisible}
        onClose={onClose}
        textPrimary={primaryBtnText}
        textSecondary="Cancel"
        textTitle="Delete Questionnaire"
        withFooter={renderFooter}>
      <div style={{ maxWidth: '500px' }}>
        <span>
          { modalContentText }
        </span>
      </div>
    </Modal>
  );
};

export default React.memo<Props>(DeleteQuestionnaireModal);
