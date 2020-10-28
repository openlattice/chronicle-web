// @flow

import { Map, fromJS } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

import {
  GET_SUBMISSIONS_BY_DATE,
  SUBMIT_TUD_DATA,
  getSubmissionsByDate,
  submitTudData,
} from './TimeUseDiaryActions';

import { TUD_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const { SUBMISSIONS_BY_DATE } = TUD_REDUX_CONSTANTS;

const { REQUEST_STATE } = ReduxConstants;

const INITIAL_STATE = fromJS({
  [GET_SUBMISSIONS_BY_DATE]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [SUBMIT_TUD_DATA]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [SUBMISSIONS_BY_DATE]: Map()
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

    case getSubmissionsByDate.case(action.type): {
      return getSubmissionsByDate.reducer(state, action, {
        REQUEST: () => state.setIn([GET_SUBMISSIONS_BY_DATE, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_SUBMISSIONS_BY_DATE, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => state
          .setIn([GET_SUBMISSIONS_BY_DATE, REQUEST_STATE], RequestStates.SUCCESS)
          .set(SUBMISSIONS_BY_DATE, action.value)
      });
    }
    default:
      return state;
  }
}
