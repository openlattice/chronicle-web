// @flow

import { Map, fromJS } from 'immutable';

import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

import {
  submitTudData,
  SUBMIT_TUD_DATA
} from './TimeUseDiaryActions';

const { REQUEST_STATE } = ReduxConstants;

const INITIAL_STATE = fromJS({
  [SUBMIT_TUD_DATA]: { [REQUEST_STATE]: RequestStates.STANDBY }
});

export default function timeUseDiaryReducer(state :Map = INITIAL_STATE, action :Object) {
  switch (action.type) {
    case submitTudData.case(action.type): {
      return submitTudData.reducer(state, action, {
        REQUEST: () => state.setIn([SUBMIT_TUD_DATA, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([SUBMIT_TUD_DATA, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => state.setIn([SUBMIT_TUD_DATA, REQUEST_STATE], RequestStates.SUCCESS)
      });
    }
    default:
      return state;
  }
}
