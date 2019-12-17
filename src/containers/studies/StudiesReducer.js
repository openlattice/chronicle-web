/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  ADD_PARTICIPANT,
  CREATE_STUDY,
  GET_STUDIES,
  addStudyParticipant,
  createStudy,
  getStudies,
} from './StudiesActions';

import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';

const INITIAL_STATE :Map<*, *> = fromJS({
  [ADD_PARTICIPANT]: { requestState: RequestStates.STANDBY },
  [CREATE_STUDY]: { requestState: RequestStates.STANDBY },
  [GET_STUDIES]: { requestState: RequestStates.STANDBY },

  participants: Map(),
  studies: Map(),
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
      const seqAction :SequenceAction = action;
      return createStudy.reducer(state, action, {
        REQUEST: () => state.setIn([CREATE_STUDY, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([CREATE_STUDY, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => {
          const { studyUUID, study } = seqAction.value;
          const updatedStudies = state.get('studies').set(studyUUID, fromJS(study));

          return state
            .set('studies', updatedStudies)
            .setIn([CREATE_STUDY, 'requestState'], RequestStates.SUCCESS);
        }
      });
    }

    case addStudyParticipant.case(action.type): {
      const seqAction :SequenceAction = action;
      return addStudyParticipant.reducer(state, action, {
        REQUEST: () => state.setIn([ADD_PARTICIPANT, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([ADD_PARTICIPANT, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => {
          const { participant } = seqAction.value;
          const { studyId } = seqAction.value;
          let participants = state.getIn(['participants', studyId], List());
          participants = participants.push(participant);

          return state
            .setIn([ADD_PARTICIPANT, 'requestState'], RequestStates.SUCCESS)
            .setIn(['participants', studyId], participants);
        }
      });
    }

    // other action types here
    default:
      return state;
  }
}
