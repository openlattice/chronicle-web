// @flow

import React, { useState } from 'react';

import { Map } from 'immutable';
import { Constants } from 'lattice';
import { useDispatch } from 'react-redux';

import ChangeActiveStatusModal from './components/ChangeActiveStatusModal';
import DeleteQuestionnaireModal from './components/DeleteQuestionnaireModal';
import QuestionnaireDetailsModal from './components/QuestionnaireDetailsModal';
import QuestionnaireListItem from './components/QuestionnaireListItem';
import { LIST_ITEM_ACTIONS } from './constants/constants';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { resetRequestState } from '../../core/redux/ReduxActions';
import { CHANGE_ACTIVE_STATUS } from '../questionnaire/QuestionnaireActions';

const { OPENLATTICE_ID_FQN } = Constants;

const {
  ACTIVE_FQN,
  DESCRIPTION_FQN,
  NAME_FQN,
  RRULE_FQN
} = PROPERTY_TYPE_FQNS;

const { DELETE, SHOW_DETAILS, TOGGLE_STATUS } = LIST_ITEM_ACTIONS;

type Props = {
  questionnaires :Map;
  studyEKID :UUID;
}
const QuestionnaireList = ({ questionnaires, studyEKID } :Props) => {
  const dispatch = useDispatch();

  // state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [changeActiveStatusModalVisible, setChangeActiveStatusModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [targetQuestionnaire, setTargetQuestionnaire] = useState(null);

  const handleOnClick = (event :SyntheticMouseEvent<HTMLElement>) => {
    const { currentTarget } = event;
    const { dataset } = currentTarget;
    const { actionId, questionnaireId } = dataset;

    if (actionId === DELETE) {
      setDeleteModalVisible(true);
    }

    if (actionId === TOGGLE_STATUS) {
      dispatch((resetRequestState(CHANGE_ACTIVE_STATUS)));
      setChangeActiveStatusModalVisible(true);
    }

    if (actionId === SHOW_DETAILS) {
      setDetailsModalVisible(true);
    }

    setTargetQuestionnaire(questionnaires.get(questionnaireId));
  };

  return (
    <div>
      {
        questionnaires.valueSeq().map((listItem) => (
          <QuestionnaireListItem
              key={listItem.getIn([OPENLATTICE_ID_FQN, 0])}
              active={listItem.getIn([ACTIVE_FQN, 0], false)}
              description={listItem.getIn([DESCRIPTION_FQN, 0])}
              handleOnClick={handleOnClick}
              questionnaireEKID={listItem.getIn([OPENLATTICE_ID_FQN, 0])}
              title={listItem.getIn([NAME_FQN, 0])} />
        ))
      }
      {
        targetQuestionnaire && (
          <>
            <DeleteQuestionnaireModal
                isVisible={deleteModalVisible}
                onClose={() => setDeleteModalVisible(false)}
                studyEKID={studyEKID}
                questionnaireEKID={targetQuestionnaire.getIn([OPENLATTICE_ID_FQN, 0])} />

            <ChangeActiveStatusModal
                activeStatus={targetQuestionnaire.getIn([ACTIVE_FQN, 0], false)}
                onCloseModal={() => setChangeActiveStatusModalVisible(false)}
                isModalVisible={changeActiveStatusModalVisible}
                studyEKID={studyEKID}
                questionnaireEKID={targetQuestionnaire.getIn([OPENLATTICE_ID_FQN, 0])} />

            <QuestionnaireDetailsModal
                description={targetQuestionnaire.getIn([DESCRIPTION_FQN, 0])}
                isModalVisible={detailsModalVisible}
                onCloseModal={() => setDetailsModalVisible(false)}
                questionnaireEKID={targetQuestionnaire.getIn([OPENLATTICE_ID_FQN, 0], false)}
                rruleSet={targetQuestionnaire.getIn([RRULE_FQN, 0])}
                title={targetQuestionnaire.getIn([NAME_FQN, 0], false)} />
          </>
        )
      }
    </div>
  );
};

export default QuestionnaireList;
