// @flow

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_CHRONICLE_APPS_DATA,
  SUBMIT_SURVEY,
  getChronicleAppsData,
  submitSurvey
} from './SurveyActions';

import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';

const INITIAL_STATE :Map<*, *, *> = fromJS({
  [GET_CHRONICLE_APPS_DATA]: {
    requestState: RequestStates.STANDBY
  },
  [SUBMIT_SURVEY]: {
    requestState: RequestStates.STANDBY
  },
  appsData: Map()
});

export default function surveyReducer(state :Map = INITIAL_STATE, action :Object) {
  switch (action.type) {
    case RESET_REQUEST_STATE: {
      const { actionType } = action;
      if (actionType && state.has(actionType)) {
        return state.setIn([actionType, 'requestState'], RequestStates.STANDBY);
      }
      return state;
    }

    case getChronicleAppsData.case(action.type): {
      const seqAction :SequenceAction = action;
      return getChronicleAppsData.reducer(state, action, {
        REQUEST: () => state.setIn([GET_CHRONICLE_APPS_DATA, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_CHRONICLE_APPS_DATA, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => state
          .set('appsData', fromJS(seqAction.value))
          .setIn([GET_CHRONICLE_APPS_DATA, 'requestState'], RequestStates.SUCCESS)
      });
    }

    case submitSurvey.case(action.type): {
      return submitSurvey.reducer(state, action, {
        REQUEST: () => state.setIn([SUBMIT_SURVEY, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([SUBMIT_SURVEY, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => state.setIn([SUBMIT_SURVEY, 'requestState'], RequestStates.SUCCESS)
      });
    }
    default:
      return state;
  }
}
