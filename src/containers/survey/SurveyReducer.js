// @flow

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { GET_CHRONICLE_USER_APPS, getChronicleUserApps } from './SurveyActions';

const INITIAL_STATE :Map<*, *, *> = fromJS({
  [GET_CHRONICLE_USER_APPS]: {
    requestState: RequestStates.STANDBY
  },
  userApps: Map()
});

export default function surveyReducer(state :Map = INITIAL_STATE, action :Object) {
  switch (action.type) {
    case getChronicleUserApps.case(action.type): {
      const seqAction :SequenceAction = action;
      return getChronicleUserApps.reducer(state, action, {
        REQUEST: () => state.setIn([GET_CHRONICLE_USER_APPS, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_CHRONICLE_USER_APPS, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => state
          .set('userApps', seqAction.value)
          .setIn([GET_CHRONICLE_USER_APPS, 'requestState'], RequestStates.SUCCESS)
      });
    }
    default:
      return state;
  }
}
