import { List, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';

import {
  GET_STUDIES,
  getStudies
} from './StudiesActions';

const INITIAL_STATE = fromJS({
  [GET_STUDIES]: { requestState: RequestStates.STANDBY },
  studies: List(),
});

export default function studiesReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case getStudies.case(action.type): {
      const seqAction = action;
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

    // other action types here
    default:
      return state;
  }
}
