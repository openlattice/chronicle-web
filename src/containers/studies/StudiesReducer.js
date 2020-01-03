/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  ADD_PARTICIPANT,
  CHANGE_ENROLLMENT_STATUS,
  CREATE_PARTICIPANTS_ENTITY_SET,
  CREATE_STUDY,
  DELETE_STUDY_PARTICIPANT,
  GET_PARTICIPANTS_ENROLLMENT,
  GET_STUDIES,
  GET_STUDY_PARTICIPANTS,
  addStudyParticipant,
  changeEnrollmentStatus,
  createParticipantsEntitySet,
  createStudy,
  deleteStudyParticipant,
  getParticipantsEnrollmentStatus,
  getStudies,
  getStudyParticipants,
} from './StudiesActions';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';

const { STATUS, STUDY_ID } = PROPERTY_TYPE_FQNS;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ADD_PARTICIPANT]: {
    requestState: RequestStates.STANDBY
  },
  [CREATE_STUDY]: {
    requestState: RequestStates.STANDBY
  },
  [CREATE_PARTICIPANTS_ENTITY_SET]: {
    requestState: RequestStates.STANDBY
  },
  [DELETE_STUDY_PARTICIPANT]: {
    requestState: RequestStates.STANDBY
  },
  [GET_STUDIES]: {
    requestState: RequestStates.STANDBY
  },
  [GET_STUDY_PARTICIPANTS]: {
    requestState: RequestStates.STANDBY
  },
  GET_PARTICIPANTS_ENROLLMENT: {
    requestState: RequestStates.STANDBY
  },
  associationKeyIds: Map(),
  participantEntitySetIds: Map(),
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
          .set('studies', Map())
          .setIn([GET_STUDIES, 'requestState'], RequestStates.FAILURE),
      });
    }

    case createStudy.case(action.type): {
      const seqAction :SequenceAction = action;
      return createStudy.reducer(state, action, {
        REQUEST: () => state
          .setIn([CREATE_STUDY, 'requestState'], RequestStates.PENDING)
          .setIn([CREATE_STUDY, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([CREATE_STUDY, seqAction.id])) {
            const study :Map = fromJS(seqAction.value);
            const entityKeyId :UUID = study.getIn([STUDY_ID, 0]);
            return state
              .setIn(['studies', entityKeyId], study)
              .setIn([CREATE_STUDY, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([CREATE_STUDY, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([CREATE_STUDY, seqAction.id]),
      });
    }

    case addStudyParticipant.case(action.type): {
      const seqAction :SequenceAction = action;
      return addStudyParticipant.reducer(state, action, {
        REQUEST: () => state.setIn([ADD_PARTICIPANT, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([ADD_PARTICIPANT, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => {
          const { entityKeyId, participantEntityData, studyId } = seqAction.value;

          return state
            .setIn([ADD_PARTICIPANT, 'requestState'], RequestStates.SUCCESS)
            .setIn(['participants', studyId, entityKeyId], participantEntityData);
        }
      });
    }

    case createParticipantsEntitySet.case(action.type): {
      const seqAction :SequenceAction = action;
      return createParticipantsEntitySet.reducer(state, action, {
        REQUEST: () => state.setIn([CREATE_PARTICIPANTS_ENTITY_SET, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([CREATE_PARTICIPANTS_ENTITY_SET, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => {
          const { entitySetName, entitySetId } = seqAction.value;
          const updatedMap = state.get('participantEntitySetIds').set(entitySetName, entitySetId);
          return state
            .setIn([CREATE_PARTICIPANTS_ENTITY_SET, 'requestState'], RequestStates.SUCCESS)
            .set('participantEntitySetIds', updatedMap);
        }
      });
    }

    case getStudyParticipants.case(action.type): {
      const seqAction :SequenceAction = action;
      return getStudyParticipants.reducer(state, action, {
        REQUEST: () => state.setIn([GET_STUDY_PARTICIPANTS, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_STUDY_PARTICIPANTS, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => {
          const {
            participants,
            participantsEntitySetId,
            participantsEntitySetName,
            studyId,
          } = seqAction.value;

          return state
            .setIn(['participants', studyId], participants)
            .setIn(['participantEntitySetIds', participantsEntitySetName], participantsEntitySetId)
            .setIn([GET_STUDY_PARTICIPANTS, 'requestState'], RequestStates.SUCCESS);
        }
      });
    }

    case deleteStudyParticipant.case(action.type): {
      const seqAction :SequenceAction = action;
      return deleteStudyParticipant.reducer(state, action, {
        REQUEST: () => state.setIn([DELETE_STUDY_PARTICIPANT, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([DELETE_STUDY_PARTICIPANT, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => {
          const { participantEntityKeyId, studyId } = seqAction.value;
          return state
            .deleteIn(['participants', studyId, participantEntityKeyId])
            .setIn([DELETE_STUDY_PARTICIPANT, 'requestState'], RequestStates.SUCCESS);
        }
      });
    }

    case getParticipantsEnrollmentStatus.case(action.type): {
      const seqAction :SequenceAction = action;
      return getParticipantsEnrollmentStatus.reducer(state, action, {
        REQUEST: () => state.setIn([GET_PARTICIPANTS_ENROLLMENT, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_PARTICIPANTS_ENROLLMENT, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => {
          const { associationKeyIds, participantsEntitySetId } = seqAction.value;
          return state
            .setIn(['associationKeyIds', participantsEntitySetId], associationKeyIds)
            .setIn([GET_PARTICIPANTS_ENROLLMENT, 'requestState'], RequestStates.SUCCESS);
        }
      });
    }

    case changeEnrollmentStatus.case(action.type): {
      const seqAction :SequenceAction = action;
      return changeEnrollmentStatus.reducer(state, action, {
        REQUEST: () => state.setIn([CHANGE_ENROLLMENT_STATUS, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([CHANGE_ENROLLMENT_STATUS, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => {
          const { newEnrollmentStatus, participantEntityKeyId, studyId } = seqAction.value;
          return state
            .setIn(['participants', studyId, participantEntityKeyId, STATUS], [newEnrollmentStatus])
            .setIn([CHANGE_ENROLLMENT_STATUS, 'requestState'], RequestStates.SUCCESS);
        }
      });
    }

    default:
      return state;
  }
}
