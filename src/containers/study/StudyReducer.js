/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  ADD_PARTICIPANT,
  CREATE_STUDY,
  GET_STUDY_DETAILS,
  addStudyParticipant,
  createStudy,
  getStudyDetails
} from './StudyActions';

const INITIAL_STATE :Map<*, *> = fromJS({
  [ADD_PARTICIPANT]: { requestState: RequestStates.STANDBY },
  [CREATE_STUDY]: { requestState: RequestStates.STANDBY },
  [GET_STUDY_DETAILS]: { requestState: RequestStates.STANDBY },
  selectedStudy: Map()
});

export default function studyReducer(state :Map = INITIAL_STATE, action :Object) {
  // const seqAction = action;
  // todo: update participants for the related study
  switch (action.type) {
    case addStudyParticipant.case(action.type):
      return addStudyParticipant.reducer(state, action, {
        REQUEST: () => state.setIn([ADD_PARTICIPANT, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([ADD_PARTICIPANT, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => state.setIn([ADD_PARTICIPANT, 'requestState'], RequestStates.SUCCESS)
      });

    case getStudyDetails.case(action.type): {
      const seqAction :SequenceAction = action;
      return getStudyDetails.reducer(state, action, {
        REQUEST: () => state.setIn([GET_STUDY_DETAILS, 'requestState'], RequestStates.PENDING),
        SUCCESS: () => state
          .setIn(['selectedStudy'], fromJS(seqAction.value))
          .setIn([GET_STUDY_DETAILS, 'requestState'], RequestStates.SUCCESS),
        FAILURE: () => state
          .set('selectedStudy', Map())
          .setIn([GET_STUDY_DETAILS, 'requestState'], RequestStates.FAILURE)
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
