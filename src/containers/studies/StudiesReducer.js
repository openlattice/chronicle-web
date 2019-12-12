/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';
import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';
import {
  GET_STUDIES,
  CREATE_STUDY,
  createStudy,
  getStudies
} from './StudiesActions';

const INITIAL_STATE :Map<*, *> = fromJS({
  [CREATE_STUDY]: { requestState: RequestStates.STANDBY },
  [GET_STUDIES]: { requestState: RequestStates.STANDBY },
  studies: List(),
});

export default function studiesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {
  switch (action.type) {
    case RESET_REQUEST_STATE: {
      const { actionType } = action;
      if (actionType && state.has(actionType)) {
        return state.setIn([actionType, 'requestState'], RequestStates.STANDBY);
      }
      return state;
    }

    case getStudies.case(action.type): {
      const seqAction :SequenceAction = action;
      return getStudies.reducer(state, action, {
        REQUEST: () => state.setIn([GET_STUDIES, 'requestState'], RequestStates.PENDING),
        SUCCESS: () => state
          .set('studies', fromJS(seqAction.value))
          .setIn([GET_STUDIES, 'requestState'], RequestStates.SUCCESS),
        FAILURE: () => state
          .set('studies', List())
          .setIn([GET_STUDIES, 'requestState'], RequestStates.FAILURE),
      });
    }

    case createStudy.case(action.type): {
      return createStudy.reducer(state, action, {
        REQUEST: () => state.setIn([CREATE_STUDY, 'requestState'], RequestStates.PENDING),
        SUCCESS: () => state.setIn([CREATE_STUDY, 'requestState'], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([CREATE_STUDY, 'requestState'], RequestStates.FAILURE)
      });
    }

    // other action types here
    default:
      return state;
  }
}
