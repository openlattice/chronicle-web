// @flow

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';


import {
  CREATE_QUESTIONNAIRE,
  createQuestionnaire
} from './QuestionnairesActions';

const INITIAL_STATE :Map = fromJS({
  [CREATE_QUESTIONNAIRE]: {
    requestState: RequestStates.STANDBY
  }
});

export default function questionnairesReducer(state :Map = INITIAL_STATE, action: Object) {
  switch (action.type) {

    case RESET_REQUEST_STATE: {
      const { actionType } = action;
      if (actionType && state.has(actionType)) {
        return state.setIn([actionType, 'requestState'], RequestStates.STANDBY);
      }
      return state;
    }

    case createQuestionnaire.case(action.type): {
      return createQuestionnaire.reducer(state, action, {
        REQUEST: () => state.setIn([CREATE_QUESTIONNAIRE, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([CREATE_QUESTIONNAIRE, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => {
          // TODO: store created data in redux
          return state
            .setIn([CREATE_QUESTIONNAIRE, 'requestState'], RequestStates.SUCCESS);
        }
      });
    }

    default:
      return state;
  }
}
