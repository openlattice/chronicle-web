// @flow

import {
  Map,
  fromJS
} from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_QUESTIONNAIRE,
  SUBMIT_QUESTIONNAIRE,
  getQuestionnaire,
  submitQuestionnaire,
} from './QuestionnaireActions';

import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';

const INITIAL_STATE = fromJS({
  [GET_QUESTIONNAIRE]: {
    requestState: RequestStates.STANDBY
  },
  [SUBMIT_QUESTIONNAIRE]: {
    requestState: RequestStates.STANDBY
  },
  data: Map()
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
    case getQuestionnaire.case(action.type): {
      const seqAction :SequenceAction = action;
      return getQuestionnaire.reducer(state, action, {
        REQUEST: () => state.setIn([GET_QUESTIONNAIRE, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_QUESTIONNAIRE, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => state
          .set('data', seqAction.value)
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
