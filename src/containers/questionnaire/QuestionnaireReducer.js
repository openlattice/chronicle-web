// @flow

import {
  Map,
  fromJS
} from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_QUESTIONNAIRE,
  GET_QUESTIONNAIRE_RESPONSES,
  GET_STUDY_QUESTIONNAIRES,
  SUBMIT_QUESTIONNAIRE,
  getQuestionnaire,
  getQuestionnaireResponses,
  getStudyQuestionnaires,
  submitQuestionnaire,
} from './QuestionnaireActions';

import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';
import { QUESTIONNAIRE_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const {
  ANSWERS_TO_QUESTIONS_MAP,
  QUESTIONNAIRE_DATA,
  QUESTIONNAIRE_QUESTIONS,
  QUESTIONNAIRE_RESPONSES,
  STUDY_QUESTIONNAIRES
} = QUESTIONNAIRE_REDUX_CONSTANTS;

const INITIAL_STATE = fromJS({
  [GET_QUESTIONNAIRE]: {
    requestState: RequestStates.STANDBY
  },
  [SUBMIT_QUESTIONNAIRE]: {
    requestState: RequestStates.STANDBY
  },
  [GET_QUESTIONNAIRE_RESPONSES]: {
    requestState: RequestStates.STANDBY
  },
  [GET_STUDY_QUESTIONNAIRES]: {
    requestState: RequestStates.STANDBY
  },
  [ANSWERS_TO_QUESTIONS_MAP]: Map(),
  [QUESTIONNAIRE_DATA]: Map(),
  [QUESTIONNAIRE_QUESTIONS]: Map(),
  [QUESTIONNAIRE_RESPONSES]: Map(),
  [STUDY_QUESTIONNAIRES]: Map()
});

export default function questionnareReducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {
    case RESET_REQUEST_STATE: {
      const { actionType } = action;
      if (actionType && state.has(actionType)) {
        return state.setIn([actionType, 'requestState'], RequestStates.STANDBY);
      }
      return state;
    }

    case getStudyQuestionnaires.case(action.type): {
      return getStudyQuestionnaires.reducer(state, action, {
        REQUEST: () => state.setIn([GET_STUDY_QUESTIONNAIRES, 'requestState'], RequestStates.STANDBY),
        FAILURE: () => state.setIn([GET_STUDY_QUESTIONNAIRES, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => {
          const {
            questionnaireToQuestionsMap,
            studyQuestionnaires,
            studyEKID
          } = action.value;

          return state
            .mergeIn([QUESTIONNAIRE_QUESTIONS], questionnaireToQuestionsMap)
            .setIn([STUDY_QUESTIONNAIRES, studyEKID], studyQuestionnaires)
            .setIn([GET_STUDY_QUESTIONNAIRES, 'requestState'], RequestStates.SUCCESS);
        }
      });
    }

    case getQuestionnaireResponses.case(action.type): {
      const seqAction :SequenceAction = action;
      return getQuestionnaireResponses.reducer(state, action, {
        REQUEST: () => state.setIn([GET_QUESTIONNAIRE_RESPONSES, 'requestState'], RequestStates.STANDBY),
        FAILURE: () => state.setIn([GET_QUESTIONNAIRE_RESPONSES, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => {
          const {
            answerIdToQuestionIdMap,
            answerValuesMap,
            participantEKID
          } = seqAction.value;

          return state
            .mergeIn([ANSWERS_TO_QUESTIONS_MAP], answerIdToQuestionIdMap)
            .setIn([QUESTIONNAIRE_RESPONSES, participantEKID], answerValuesMap)
            .setIn([GET_QUESTIONNAIRE_RESPONSES, 'requestState'], RequestStates.SUCCESS);
        }
      });
    }
    case getQuestionnaire.case(action.type): {
      const seqAction :SequenceAction = action;
      return getQuestionnaire.reducer(state, action, {
        REQUEST: () => state.setIn([GET_QUESTIONNAIRE, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_QUESTIONNAIRE, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => state
          .set(QUESTIONNAIRE_DATA, seqAction.value)
          .setIn([GET_QUESTIONNAIRE, 'requestState'], RequestStates.SUCCESS)
      });
    }

    case submitQuestionnaire.case(action.type): {
      return submitQuestionnaire.reducer(state, action, {
        REQUEST: () => state.setIn([SUBMIT_QUESTIONNAIRE, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([SUBMIT_QUESTIONNAIRE, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => state.setIn([SUBMIT_QUESTIONNAIRE, 'requestState'], RequestStates.SUCCESS)
      });
    }
    default:
      return state;
  }
}
