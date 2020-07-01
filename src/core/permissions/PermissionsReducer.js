// @flow

import { Map, fromJS } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

import {
  GET_STUDY_AUTHORIZATIONS,
  UPDATE_ES_PERMISSIONS,
  getStudyAuthorizations,
  updateEntitySetPermissions
} from './PermissionsActions';

const { REQUEST_STATE } = ReduxConstants;

const INITIAL_STATE :Map = fromJS({
  [GET_STUDY_AUTHORIZATIONS]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [UPDATE_ES_PERMISSIONS]: { [REQUEST_STATE]: RequestStates.STANDBY },
});

export default function permissionsReducer(state :Map = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case updateEntitySetPermissions.case(action.type):
      return updateEntitySetPermissions.reducer(state, action, {
        REQUEST: () => state.setIn([UPDATE_ES_PERMISSIONS, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([UPDATE_ES_PERMISSIONS, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => state.setIn([UPDATE_ES_PERMISSIONS, REQUEST_STATE], RequestStates.SUCCESS)
      });

    case getStudyAuthorizations.case(action.type): {
      return getStudyAuthorizations.reducer(state, action, {
        REQUEST: () => state.setIn([GET_STUDY_AUTHORIZATIONS, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_STUDY_AUTHORIZATIONS, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => state.setIn([GET_STUDY_AUTHORIZATIONS, REQUEST_STATE], RequestStates.SUCCESS)
      });
    }

    default:
      return state;
  }
}
