// @flow

import { Map, fromJS } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

import {
  DOWNLOAD_TUD_RESPONSES,
  GET_SUBMISSIONS_BY_DATE,
  SUBMIT_TUD_DATA,
  downloadTudResponses,
  getSubmissionsByDate,
  submitTudData,
} from './TimeUseDiaryActions';

import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';
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

    case RESET_REQUEST_STATE: {
      const { actionType } = action;
      if (actionType && state.has(actionType)) {
        return state.setIn([actionType, REQUEST_STATE], RequestStates.STANDBY);
      }
      return state;
    }

    case submitTudData.case(action.type): {
      return submitTudData.reducer(state, action, {
        REQUEST: () => state.setIn([SUBMIT_TUD_DATA, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([SUBMIT_TUD_DATA, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => state.setIn([SUBMIT_TUD_DATA, REQUEST_STATE], RequestStates.SUCCESS)
      });
    }

    case getSubmissionsByDate.case(action.type): {
      return getSubmissionsByDate.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_SUBMISSIONS_BY_DATE, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_SUBMISSIONS_BY_DATE, action.id], action),
        FAILURE: () => state.setIn([GET_SUBMISSIONS_BY_DATE, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => state
          .setIn([GET_SUBMISSIONS_BY_DATE, REQUEST_STATE], RequestStates.SUCCESS)
          .set(SUBMISSIONS_BY_DATE, action.value),
        FINALLY: () => state.deleteIn([GET_SUBMISSIONS_BY_DATE, action.id])
      });
    }

    case downloadTudResponses.case(action.type): {
      const date = action.value;
      return downloadTudResponses.reducer(state, action, {
        REQUEST: () => state
          .setIn([DOWNLOAD_TUD_RESPONSES, REQUEST_STATE, date], RequestStates.PENDING)
          .setIn([DOWNLOAD_TUD_RESPONSES, action.id], action),
        FAILURE: () => state.setIn([DOWNLOAD_TUD_RESPONSES, REQUEST_STATE, date], RequestStates.FAILURE),
        SUCCESS: () => state.setIn([DOWNLOAD_TUD_RESPONSES, REQUEST_STATE, date], RequestStates.SUCCESS),
        FINALLY: () => state.deleteIn([DOWNLOAD_TUD_RESPONSES, action.id])
      });
    }

    default:
      return state;
  }
}
