/*
 * @flow
 */

import {
  Map,
  fromJS,
  getIn
} from 'immutable';
// import { Constants } from 'lattice';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  ADD_PARTICIPANT,
  CHANGE_ENROLLMENT_STATUS,
  // CREATE_NOTIFICATIONS_ENTITY_SETS,
  CREATE_PARTICIPANTS_ENTITY_SET,
  CREATE_STUDY,
  DELETE_STUDY_PARTICIPANT,
  GET_PARTICIPANTS_ENROLLMENT,
  GET_STUDIES,
  // GET_STUDY_NOTIFICATION_STATUS,
  GET_STUDY_PARTICIPANTS,
  UPDATE_STUDY,
  addStudyParticipant,
  changeEnrollmentStatus,
  // createNotificationsEntitySets,
  createParticipantsEntitySet,
  createStudy,
  deleteStudyParticipant,
  getParticipantsEnrollmentStatus,
  getStudies,
  // getStudyNotificationStatus,
  getStudyParticipants,
  updateStudy,
} from './StudiesActions';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';

// const { OPENLATTICE_ID_FQN } = Constants;

const {
  DATE_ENROLLED,
  // NOTIFICATION_ID,
  STATUS,
  STUDY_ID,
} = PROPERTY_TYPE_FQNS;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ADD_PARTICIPANT]: {
    requestState: RequestStates.STANDBY
  },
  // 2020-04-08 NOTE: disabling notification feature for now
  // [CREATE_NOTIFICATIONS_ENTITY_SETS]: {
  //   requestState: RequestStates.STANDBY
  // },
  [CREATE_STUDY]: {
    requestState: RequestStates.STANDBY
  },
  [CREATE_PARTICIPANTS_ENTITY_SET]: {
    requestState: RequestStates.STANDBY
  },
  [DELETE_STUDY_PARTICIPANT]: {
    requestState: RequestStates.STANDBY
  },
  [GET_PARTICIPANTS_ENROLLMENT]: {
    requestState: RequestStates.STANDBY
  },
  [GET_STUDIES]: {
    requestState: RequestStates.STANDBY
  },
  [GET_STUDY_PARTICIPANTS]: {
    requestState: RequestStates.STANDBY
  },
  // 2020-04-08 NOTE: disabling notification feature for now
  // [GET_STUDY_NOTIFICATION_STATUS]: {
  //   requestState: RequestStates.STANDBY
  // },
  [UPDATE_STUDY]: {
    requestState: RequestStates.STANDBY
  },
  associationKeyIds: Map(),
  participantEntitySetIds: Map(),
  participants: Map(),
  studies: Map(),
  // studyNotifications: Map()
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

            const {
              // associationVal,
              // notificationEntitySetId,
              // partOfEntityKeyId,
              // partOfEntitySetId,
              studyEntityData
            } = seqAction.value;

            const studyId :UUID = getIn(studyEntityData, [STUDY_ID, 0]);
            // const studyEntityKeyId :UUID = getIn(studyEntityData, [OPENLATTICE_ID_FQN, 0]);

            // 2020-04-08 NOTE: disabling notification feature for now
            // const notificationsMap = Map().withMutations((map) => {
            //   map
            //     .setIn(['associationEntitySet', 'id'], partOfEntitySetId)
            //     .setIn(['neighborEntitySet', 'id'], notificationEntitySetId)
            //     .setIn(['associationDetails', OPENLATTICE_ID_FQN], [partOfEntityKeyId])
            //     .setIn(['associationDetails', NOTIFICATION_ID], [associationVal]);
            // });

            return state
              .setIn(['studies', studyId], fromJS(studyEntityData))
              .setIn([CREATE_STUDY, 'requestState'], RequestStates.SUCCESS);
            // 2020-04-08 NOTE: disabling notification feature for now
            // .setIn(['studyNotifications', studyEntityKeyId], notificationsMap);
          }
          return state;
        },
        FAILURE: () => state.setIn([CREATE_STUDY, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([CREATE_STUDY, seqAction.id]),
      });
    }

    case updateStudy.case(action.type): {
      const seqAction :SequenceAction = action;
      return updateStudy.reducer(state, action, {
        REQUEST: () => state.setIn([UPDATE_STUDY, 'requestState'], RequestStates.PENDING),
        SUCCESS: () => {
          const {
            // associationVal,
            // notificationEntitySetId,
            // partOfEntityKeyId,
            // partOfEntitySetId,
            studyEntityData
          } = seqAction.value;

          const studyId :UUID = getIn(studyEntityData, [STUDY_ID, 0]);
          // const studyEntityKeyId :UUID = getIn(studyEntityData, [OPENLATTICE_ID_FQN, 0]);

          // const notificationsMap = Map().withMutations((map) => {
          //   map
          //     .setIn(['associationEntitySet', 'id'], partOfEntitySetId)
          //     .setIn(['neighborEntitySet', 'id'], notificationEntitySetId)
          //     .setIn(['associationDetails', OPENLATTICE_ID_FQN], [partOfEntityKeyId])
          //     .setIn(['associationDetails', NOTIFICATION_ID], [associationVal]);
          // });
          return state
            .setIn(['studies', studyId], fromJS(studyEntityData))
            // 2020-04-08 NOTE: disabling notification feature for now
            // .setIn(['studyNotifications', studyEntityKeyId], notificationsMap)
            .setIn([UPDATE_STUDY, 'requestState'], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([UPDATE_STUDY, 'requestState'], RequestStates.FAILURE)
      });
    }

    case addStudyParticipant.case(action.type): {
      const seqAction :SequenceAction = action;
      return addStudyParticipant.reducer(state, action, {
        REQUEST: () => state.setIn([ADD_PARTICIPANT, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([ADD_PARTICIPANT, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => {
          const {
            participantEntityData,
            participantEntityKeyId,
            participantsEntitySetName,
            participatedInEntityKeyId,
            studyId
          } = seqAction.value;

          return state
            .setIn([ADD_PARTICIPANT, 'requestState'], RequestStates.SUCCESS)
            .setIn(['participants', studyId, participantEntityKeyId], participantEntityData)
            .setIn(['associationKeyIds', participantsEntitySetName, participantEntityKeyId], participatedInEntityKeyId);
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
          const { associationKeyIds, participantsEntitySetName } = seqAction.value;
          return state
            .setIn(['associationKeyIds', participantsEntitySetName], associationKeyIds)
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
          const {
            enrollmentDate,
            newEnrollmentStatus,
            participantEntityKeyId,
            studyId
          } = seqAction.value;
          return state
            .setIn(['participants', studyId, participantEntityKeyId, STATUS], [newEnrollmentStatus])
            .setIn(['participants', studyId, participantEntityKeyId, DATE_ENROLLED], [enrollmentDate])
            .setIn([CHANGE_ENROLLMENT_STATUS, 'requestState'], RequestStates.SUCCESS);
        }
      });
    }

    // case createNotificationsEntitySets.case(action.type): {
    //   // const seqAction :SequenceAction = action;
    //   return createNotificationsEntitySets.reducer(state, action, {
    //     REQUEST: () => state.setIn([CREATE_NOTIFICATIONS_ENTITY_SETS, 'requestState'], RequestStates.PENDING),
    //     FAILURE: () => state.setIn([CREATE_NOTIFICATIONS_ENTITY_SETS, 'requestState'], RequestStates.FAILURE),
    //     SUCCESS: () => state.setIn([CREATE_NOTIFICATIONS_ENTITY_SETS, 'requestState'], RequestStates.SUCCESS)
    //   });
    // }

    // 2020-04-08 NOTE: disabling notification feature for now
    // case getStudyNotificationStatus.case(action.type): {
    //   const seqAction :SequenceAction = action;
    //   return getStudyNotificationStatus.reducer(state, action, {
    //     REQUEST: () => state.setIn([GET_STUDY_NOTIFICATION_STATUS, 'requestState'], RequestStates.PENDING),
    //     FAILURE: () => state.setIn([GET_STUDY_NOTIFICATION_STATUS, 'requestState'], RequestStates.FAILURE),
    //     SUCCESS: () => state
    //       .setIn([GET_STUDY_NOTIFICATION_STATUS, 'requestState'], RequestStates.SUCCESS)
    //       .set('studyNotifications', fromJS(seqAction.value))
    //   });
    // }

    default:
      return state;
  }
}
