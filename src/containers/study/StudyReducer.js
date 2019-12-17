/*
 * @flow
 */

import { fromJS, List, Map } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  ADD_PARTICIPANT,
  CREATE_STUDY,
  GET_STUDY_DETAILS,
  addStudyParticipant,
  createStudy,
} from './StudyActions';

const INITIAL_STATE :Map<*, *> = fromJS({
  [ADD_PARTICIPANT]: { requestState: RequestStates.STANDBY },
  [CREATE_STUDY]: { requestState: RequestStates.STANDBY },
  [GET_STUDY_DETAILS]: { requestState: RequestStates.STANDBY },
  participants: Map(),
});

export default function studyReducer(state :Map = INITIAL_STATE, action :Object) {
  switch (action.type) {
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

    case createStudy.case(action.type): {
      return createStudy.reducer(state, action, {
        REQUEST: () => state.setIn([CREATE_STUDY, 'requestState'], RequestStates.PENDING),
        SUCCESS: () => state.setIn([CREATE_STUDY, 'requestState'], RequestStates.SUCCESS),
        FAILURE: () => state.setIn([CREATE_STUDY, 'requestState'], RequestStates.FAILURE)
      });
    }

    default:
      return state;
  }
}
