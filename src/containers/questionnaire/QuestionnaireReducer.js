// @flow

import {
  Map,
  fromJS
} from 'immutable';
import { RequestStates } from 'redux-reqseq';

import type { SequenceAction } from 'redux-reqseq';

import {
  getQuestionnaire,
  GET_QUESTIONNAIRE
} from './QuestionnaireActions';

const INITIAL_STATE = fromJS({
  [GET_QUESTIONNAIRE]: {
    requestState: RequestStates.STANDBY
  },
  data: Map()
});

export default function questionnareReducer(state :Map = INITIAL_STATE, action :Object) {
  switch (action.type) {
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
    default:
      return state;
  }
}
