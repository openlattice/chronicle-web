// @flow

import { Map, fromJS } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  DOWNLOAD_QUESTIONNAIRE_RESPONSES,
  GET_QUESTIONNAIRE,
  GET_QUESTIONNAIRE_RESPONSES,
  GET_STUDY_QUESTIONNAIRES,
  SUBMIT_QUESTIONNAIRE,
  downloadQuestionnaireResponses,
  getQuestionnaire,
  getQuestionnaireResponses,
  getStudyQuestionnaires,
  submitQuestionnaire,
} from './QuestionnaireActions';

import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';
import { QUESTIONNAIRE_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const { REQUEST_STATE } = ReduxConstants;

const {
  ANSWER_QUESTION_ID_MAP,
  QUESTION_ANSWERS_MAP,
  QUESTIONNAIRE_DATA,
  QUESTIONNAIRE_QUESTIONS,
  QUESTIONNAIRE_RESPONSES,
  STUDY_QUESTIONNAIRES,
} = QUESTIONNAIRE_REDUX_CONSTANTS;

const INITIAL_STATE = fromJS({
  [DOWNLOAD_QUESTIONNAIRE_RESPONSES]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [GET_QUESTIONNAIRE]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [GET_QUESTIONNAIRE_RESPONSES]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [GET_STUDY_QUESTIONNAIRES]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [SUBMIT_QUESTIONNAIRE]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [ANSWER_QUESTION_ID_MAP]: Map(),
  [QUESTION_ANSWERS_MAP]: Map(),
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
        return state.setIn([actionType, REQUEST_STATE], RequestStates.STANDBY);
      }
      return state;
    }

    case downloadQuestionnaireResponses.case(action.type): {
      return downloadQuestionnaireResponses.reducer(state, action, {
        REQUEST: () => state.setIn([DOWNLOAD_QUESTIONNAIRE_RESPONSES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state.setIn([DOWNLOAD_QUESTIONNAIRE_RESPONSES, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([DOWNLOAD_QUESTIONNAIRE_RESPONSES, REQUEST_STATE], RequestStates.FAILURE)
      });
    }

    case getStudyQuestionnaires.case(action.type): {
      return getStudyQuestionnaires.reducer(state, action, {
        REQUEST: () => state.setIn([GET_STUDY_QUESTIONNAIRES, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_STUDY_QUESTIONNAIRES, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => {
          const {
            questionnaireToQuestionsMap,
            studyQuestionnaires,
            studyEKID
          } = action.value;

          return state
            .mergeIn([QUESTIONNAIRE_QUESTIONS], questionnaireToQuestionsMap)
            .setIn([STUDY_QUESTIONNAIRES, studyEKID], studyQuestionnaires)
            .setIn([GET_STUDY_QUESTIONNAIRES, REQUEST_STATE], RequestStates.SUCCESS);
        }
      });
    }

    case getQuestionnaireResponses.case(action.type): {
      const seqAction :SequenceAction = action;
      return getQuestionnaireResponses.reducer(state, action, {
        REQUEST: () => state.setIn([GET_QUESTIONNAIRE_RESPONSES, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_QUESTIONNAIRE_RESPONSES, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => {
          const {
            answerQuestionIdMap,
            answersById,
            participantEKID,
            questionAnswersMap,
          } = seqAction.value;

          return state
            .mergeIn([QUESTION_ANSWERS_MAP], questionAnswersMap)
            .setIn([QUESTIONNAIRE_RESPONSES, participantEKID], answersById)
            .mergeIn([ANSWER_QUESTION_ID_MAP], answerQuestionIdMap)
            .setIn([GET_QUESTIONNAIRE_RESPONSES, REQUEST_STATE], RequestStates.SUCCESS);
        }
      });
    }
    case getQuestionnaire.case(action.type): {
      const seqAction :SequenceAction = action;
      return getQuestionnaire.reducer(state, action, {
        REQUEST: () => state.setIn([GET_QUESTIONNAIRE, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_QUESTIONNAIRE, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => state
          .set(QUESTIONNAIRE_DATA, seqAction.value)
          .setIn([GET_QUESTIONNAIRE, REQUEST_STATE], RequestStates.SUCCESS)
      });
    }

    case submitQuestionnaire.case(action.type): {
      return submitQuestionnaire.reducer(state, action, {
        REQUEST: () => state.setIn([SUBMIT_QUESTIONNAIRE, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([SUBMIT_QUESTIONNAIRE, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => state.setIn([SUBMIT_QUESTIONNAIRE, REQUEST_STATE], RequestStates.SUCCESS)
      });
    }
    default:
      return state;
  }
}
