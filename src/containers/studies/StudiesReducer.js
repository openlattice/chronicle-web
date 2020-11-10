/*
 * @flow
 */

import {
  Map,
  Set,
  fromJS,
} from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  ADD_PARTICIPANT,
  CHANGE_ENROLLMENT_STATUS,
  CREATE_NOTIFICATIONS_ENTITY_SETS,
  CREATE_PARTICIPANTS_ENTITY_SET,
  CREATE_STUDY,
  DELETE_STUDY_PARTICIPANT,
  GET_GLOBAL_NOTIFICATIONS_EKID,
  GET_STUDIES,
  GET_STUDY_NOTIFICATION_STATUS,
  GET_STUDY_PARTICIPANTS,
  GET_TIME_USE_DIARY_STUDIES,
  RESET_DELETE_PARTICIPANT_TIMEOUT,
  UPDATE_STUDY,
  addStudyParticipant,
  changeEnrollmentStatus,
  createNotificationsEntitySets,
  createParticipantsEntitySet,
  createStudy,
  deleteStudyParticipant,
  getGlobalNotificationsEKID,
  getStudies,
  getStudyNotificationStatus,
  getStudyParticipants,
  getTimeUseDiaryStudies,
  updateStudy
} from './StudiesActions';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';
import { STUDIES_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const { REQUEST_STATE } = ReduxConstants;
const { DATE_ENROLLED, STATUS } = PROPERTY_TYPE_FQNS;

const {
  GLOBAL_NOTIFICATIONS_EKID,
  NOTIFICATIONS_ENABLED_STUDIES,
  PART_OF_ASSOCIATION_EKID_MAP,
  STUDIES,
  TIMEOUT,
  TIME_USE_DIARY_STUDIES
} = STUDIES_REDUX_CONSTANTS;

const INITIAL_STATE :Map<*, *> = fromJS({
  [ADD_PARTICIPANT]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [CREATE_NOTIFICATIONS_ENTITY_SETS]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [CREATE_STUDY]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [CREATE_PARTICIPANTS_ENTITY_SET]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [DELETE_STUDY_PARTICIPANT]: {
    [REQUEST_STATE]: RequestStates.STANDBY,
    [TIMEOUT]: false
  },
  [GET_GLOBAL_NOTIFICATIONS_EKID]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [GET_STUDIES]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [GET_STUDY_PARTICIPANTS]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [GET_STUDY_NOTIFICATION_STATUS]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [GET_TIME_USE_DIARY_STUDIES]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [UPDATE_STUDY]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [GLOBAL_NOTIFICATIONS_EKID]: undefined,
  [NOTIFICATIONS_ENABLED_STUDIES]: Set(),
  [PART_OF_ASSOCIATION_EKID_MAP]: Map(),
  [STUDIES]: Map(),
  [TIME_USE_DIARY_STUDIES]: Set(),
  participantEntitySetIds: Map(),
  participants: Map(),
});

export default function studiesReducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      const { actionType } = action;
      if (actionType && state.has(actionType)) {
        return state.setIn([actionType, REQUEST_STATE], RequestStates.STANDBY);
      }
      return state;
    }

    case RESET_DELETE_PARTICIPANT_TIMEOUT: {
      return state.setIn([DELETE_STUDY_PARTICIPANT, TIMEOUT], false);
    }

    case getStudies.case(action.type): {
      const seqAction :SequenceAction = action;
      return getStudies.reducer(state, action, {
        REQUEST: () => state.setIn([GET_STUDIES, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => state
          .set('studies', fromJS(seqAction.value))
          .setIn([GET_STUDIES, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .set('studies', Map())
          .setIn([GET_STUDIES, REQUEST_STATE], RequestStates.FAILURE),
      });
    }

    case createStudy.case(action.type): {
      const seqAction :SequenceAction = action;
      return createStudy.reducer(state, action, {
        REQUEST: () => state
          .setIn([CREATE_STUDY, REQUEST_STATE], RequestStates.PENDING)
          .setIn([CREATE_STUDY, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([CREATE_STUDY, seqAction.id])) {
            const {
              notificationsEnabled,
              partOfEntityKeyId,
              studyEntityData,
              studyId
            } = seqAction.value;

            const notificationEnabledStudies = state.get(NOTIFICATIONS_ENABLED_STUDIES, Set());

            return state
              .set(NOTIFICATIONS_ENABLED_STUDIES,
                notificationsEnabled ? notificationEnabledStudies.add(studyId) : notificationEnabledStudies)
              .setIn([STUDIES, studyId], fromJS(studyEntityData))
              .setIn([PART_OF_ASSOCIATION_EKID_MAP, studyId], partOfEntityKeyId)
              .setIn([CREATE_STUDY, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([CREATE_STUDY, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([CREATE_STUDY, seqAction.id]),
      });
    }

    case updateStudy.case(action.type): {
      const seqAction :SequenceAction = action;
      return updateStudy.reducer(state, action, {
        REQUEST: () => state.setIn([UPDATE_STUDY, REQUEST_STATE], RequestStates.PENDING),
        SUCCESS: () => {
          const {
            notificationsEnabled,
            partOfEntityKeyId,
            studyEntityData,
            studyId
          } = seqAction.value;

          let notificationEnabledStudies = state.get(NOTIFICATIONS_ENABLED_STUDIES, Set()).asMutable();

          if (notificationsEnabled) {
            notificationEnabledStudies = notificationEnabledStudies.add(studyId);
          }
          else {
            notificationEnabledStudies = notificationEnabledStudies.delete(studyId);
          }

          return state
            .set(NOTIFICATIONS_ENABLED_STUDIES, notificationEnabledStudies.asImmutable())
            .setIn([STUDIES, studyId], fromJS(studyEntityData))
            .setIn([PART_OF_ASSOCIATION_EKID_MAP, studyId], partOfEntityKeyId)
            .setIn([UPDATE_STUDY, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state.setIn([UPDATE_STUDY, REQUEST_STATE], RequestStates.FAILURE)
      });
    }

    case addStudyParticipant.case(action.type): {
      const seqAction :SequenceAction = action;
      return addStudyParticipant.reducer(state, action, {
        REQUEST: () => state.setIn([ADD_PARTICIPANT, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([ADD_PARTICIPANT, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => {
          const { participantEntityData, participantEntityKeyId, studyId } = seqAction.value;

          return state
            .setIn([ADD_PARTICIPANT, REQUEST_STATE], RequestStates.SUCCESS)
            .setIn(['participants', studyId, participantEntityKeyId], participantEntityData);
        }
      });
    }

    case createParticipantsEntitySet.case(action.type): {
      const seqAction :SequenceAction = action;
      return createParticipantsEntitySet.reducer(state, action, {
        REQUEST: () => state.setIn([CREATE_PARTICIPANTS_ENTITY_SET, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([CREATE_PARTICIPANTS_ENTITY_SET, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => {
          const { entitySetName, entitySetId } = seqAction.value;
          const updatedMap = state.get('participantEntitySetIds').set(entitySetName, entitySetId);
          return state
            .setIn([CREATE_PARTICIPANTS_ENTITY_SET, REQUEST_STATE], RequestStates.SUCCESS)
            .set('participantEntitySetIds', updatedMap);
        }
      });
    }

    case getStudyParticipants.case(action.type): {
      const seqAction :SequenceAction = action;
      return getStudyParticipants.reducer(state, action, {
        REQUEST: () => state.setIn([GET_STUDY_PARTICIPANTS, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_STUDY_PARTICIPANTS, REQUEST_STATE], RequestStates.FAILURE),
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
            .setIn([GET_STUDY_PARTICIPANTS, REQUEST_STATE], RequestStates.SUCCESS);
        }
      });
    }

    case deleteStudyParticipant.case(action.type): {
      const seqAction :SequenceAction = action;
      return deleteStudyParticipant.reducer(state, action, {
        REQUEST: () => state.setIn([DELETE_STUDY_PARTICIPANT, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([DELETE_STUDY_PARTICIPANT, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => {
          const { participantEntityKeyId, studyId, timeout } = seqAction.value;

          return state
            .deleteIn(['participants', studyId, participantEntityKeyId])
            .setIn([DELETE_STUDY_PARTICIPANT, TIMEOUT], timeout)
            .setIn([DELETE_STUDY_PARTICIPANT, REQUEST_STATE], RequestStates.SUCCESS);
        }
      });
    }

    case changeEnrollmentStatus.case(action.type): {
      const seqAction :SequenceAction = action;
      return changeEnrollmentStatus.reducer(state, action, {
        REQUEST: () => state.setIn([CHANGE_ENROLLMENT_STATUS, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([CHANGE_ENROLLMENT_STATUS, REQUEST_STATE], RequestStates.FAILURE),
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
            .setIn([CHANGE_ENROLLMENT_STATUS, REQUEST_STATE], RequestStates.SUCCESS);
        }
      });
    }

    case createNotificationsEntitySets.case(action.type): {
      return createNotificationsEntitySets.reducer(state, action, {
        REQUEST: () => state.setIn([CREATE_NOTIFICATIONS_ENTITY_SETS, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([CREATE_NOTIFICATIONS_ENTITY_SETS, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => state.setIn([CREATE_NOTIFICATIONS_ENTITY_SETS, REQUEST_STATE], RequestStates.SUCCESS)
      });
    }

    case getStudyNotificationStatus.case(action.type): {
      const seqAction :SequenceAction = action;
      return getStudyNotificationStatus.reducer(state, action, {
        REQUEST: () => state.setIn([GET_STUDY_NOTIFICATION_STATUS, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_STUDY_NOTIFICATION_STATUS, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => {
          const { studiesWithNotifications, associationEKIDMap } = seqAction.value;
          return state
            .set(NOTIFICATIONS_ENABLED_STUDIES, studiesWithNotifications)
            .set(PART_OF_ASSOCIATION_EKID_MAP, associationEKIDMap)
            .setIn([GET_STUDY_NOTIFICATION_STATUS, REQUEST_STATE], RequestStates.SUCCESS);
        }
      });
    }

    case getGlobalNotificationsEKID.case(action.type): {
      const seqAction :SequenceAction = action;
      return getGlobalNotificationsEKID.reducer(state, action, {
        REQUEST: () => state.setIn([GET_GLOBAL_NOTIFICATIONS_EKID, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_GLOBAL_NOTIFICATIONS_EKID, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => state
          .setIn([GET_GLOBAL_NOTIFICATIONS_EKID, REQUEST_STATE], RequestStates.SUCCESS)
          .set(GLOBAL_NOTIFICATIONS_EKID, seqAction.value)
      });
    }

    case getTimeUseDiaryStudies.case(action.type): {
      return getTimeUseDiaryStudies.reducer(state, action, {
        REQUEST: () => state.setIn([GET_TIME_USE_DIARY_STUDIES, REQUEST_STATE], RequestStates.PENDING),
        FAILURE: () => state.setIn([GET_TIME_USE_DIARY_STUDIES, REQUEST_STATE], RequestStates.FAILURE),
        SUCCESS: () => state
          .setIn([GET_TIME_USE_DIARY_STUDIES, REQUEST_STATE], RequestStates.SUCCESS)
          .set(GET_TIME_USE_DIARY_STUDIES, action.value)
      });
    }

    default:
      return state;
  }
}
