// @flow

import { Map, fromJS } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

import {
  DOWNLOAD_ALL_TUD_DATA,
  DOWNLOAD_DAILY_TUD_DATA,
  GET_SUBMISSIONS_BY_DATE,
  SUBMIT_TUD_DATA,
  VERIFY_TUD_LINK,
  downloadAllTudData,
  downloadDailyTudData,
  getSubmissionsByDate,
  submitTudData,
  verifyTudLink,
} from './TimeUseDiaryActions';

import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';
import { TUD_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const { SUBMISSIONS_BY_DATE } = TUD_REDUX_CONSTANTS;

const { REQUEST_STATE } = ReduxConstants;

const INITIAL_STATE = fromJS({
  [DOWNLOAD_ALL_TUD_DATA]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [GET_SUBMISSIONS_BY_DATE]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [SUBMIT_TUD_DATA]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [SUBMISSIONS_BY_DATE]: Map(),
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

    case verifyTudLink.case(action.type): {
      return verifyTudLink.reducer(state, action, {
        REQUEST: () => state.setIn([VERIFY_TUD_LINK, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([VERIFY_TUD_LINK, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => state.setIn([VERIFY_TUD_LINK, REQUEST_STATE], RequestStates.SUCCESS)
      });
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

    case downloadDailyTudData.case(action.type): {
      const { date, dataType } = action.value;
      return downloadDailyTudData.reducer(state, action, {
        REQUEST: () => state.setIn([DOWNLOAD_DAILY_TUD_DATA, REQUEST_STATE, date, dataType], RequestStates.PENDING),
        FAILURE: () => state
          .setIn([DOWNLOAD_DAILY_TUD_DATA, REQUEST_STATE, date, dataType], RequestStates.FAILURE),
        SUCCESS: () => state
          .setIn([DOWNLOAD_DAILY_TUD_DATA, REQUEST_STATE, date, dataType], RequestStates.SUCCESS),
        FINALLY: () => state.deleteIn([DOWNLOAD_DAILY_TUD_DATA, action.id])
      });
    }

    case downloadAllTudData.case(action.type): {
      return downloadAllTudData.reducer(state, action, {
        REQUEST: () => state
          .setIn([DOWNLOAD_ALL_TUD_DATA, REQUEST_STATE], RequestStates.PENDING)
          .setIn([DOWNLOAD_ALL_TUD_DATA, action.id], action),
        FAILURE: () => state
          .setIn([DOWNLOAD_ALL_TUD_DATA, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => state
          .setIn([DOWNLOAD_ALL_TUD_DATA, REQUEST_STATE], RequestStates.SUCCESS),
        FINALLY: () => state
          .deleteIn([DOWNLOAD_ALL_TUD_DATA, action.id])
      });
    }

    default:
      return state;
  }
}
