// @flow

import { Map, fromJS } from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';

import {
  GET_DELETE_PERMISSION,
  GET_STUDY_AUTHORIZATIONS,
  UPDATE_ES_PERMISSIONS,
  getDeletePermission,
  getStudyAuthorizations,
  updateEntitySetPermissions
} from './PermissionsActions';

import { PERMISSIONS_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const { REQUEST_STATE } = ReduxConstants;
const { HAS_DELETE_PERMISSION } = PERMISSIONS_REDUX_CONSTANTS;

const INITIAL_STATE :Map = fromJS({
  [GET_DELETE_PERMISSION]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [GET_STUDY_AUTHORIZATIONS]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [UPDATE_ES_PERMISSIONS]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [HAS_DELETE_PERMISSION]: false
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

    case getDeletePermission.case(action.type): {
      return getDeletePermission.reducer(state, action, {
        REQUEST: () => state.setIn([GET_DELETE_PERMISSION, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state
          .setIn([GET_DELETE_PERMISSION, REQUEST_STATE], RequestStates.PENDING)
          .set(HAS_DELETE_PERMISSION, false),
        SUCCESS: () => state
          .setIn([GET_DELETE_PERMISSION, REQUEST_STATE], RequestStates.SUCCESS)
          .set(HAS_DELETE_PERMISSION, true),
        FINALLY: () => state.deleteIn([GET_DELETE_PERMISSION, action.id]),
      });
    }

    default:
      return state;
  }
}
