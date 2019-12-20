/*
 * @flow
 */

import {
  List,
  Map,
  fromJS,
  get
} from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';
import { Constants } from 'lattice';
import {
  ADD_PARTICIPANT,
  CREATE_PARTICIPANTS_ENTITY_SET,
  CREATE_STUDY,
  GET_STUDIES,
  addStudyParticipant,
  createParticipantsEntitySet,
  createStudy,
  getStudies,
} from './StudiesActions';

import { ENTITY_SET_NAMES } from '../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { RESET_REQUEST_STATE } from '../../core/redux/ReduxActions';

const { getPageSectionKey, getEntityAddressKey } = DataProcessingUtils;

const { OPENLATTICE_ID_FQN } = Constants;

const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const {
  PERSON_ID,
  STUDY_DESCRIPTION,
  STUDY_EMAIL,
  STUDY_GROUP,
  STUDY_ID,
  STUDY_NAME,
  STUDY_VERSION,
} = PROPERTY_TYPE_FQNS;
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
  [GET_STUDIES]: {
    requestState: RequestStates.STANDBY
  },

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
        REQUEST: () => state.setIn([CREATE_STUDY, 'requestState'], RequestStates.PENDING),
        FAILURE: () => state.setIn([CREATE_STUDY, 'requestState'], RequestStates.FAILURE),
        SUCCESS: () => {
          const newStudyData = seqAction.value;
          const pageSection = get(newStudyData, getPageSectionKey(1, 1));
          const study = {
            [STUDY_ID.toString()]:
              [get(pageSection, getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID))],
            [STUDY_NAME.toString()]:
              [get(pageSection, getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_NAME))],
            [STUDY_DESCRIPTION.toString()]:
              [get(pageSection, getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_DESCRIPTION))],
            [STUDY_VERSION.toString()]:
              [get(pageSection, getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_VERSION))],
            [STUDY_GROUP.toString()]:
              [get(pageSection, getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_GROUP))],
            [STUDY_EMAIL.toString()]:
              [get(pageSection, getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_EMAIL))],
            [OPENLATTICE_ID_FQN.toString()]:
              [get(pageSection, getEntityAddressKey(0, CHRONICLE_STUDIES, OPENLATTICE_ID_FQN))],
          };
          const updatedStudies = state.get('studies').set(study[STUDY_ID.toString()], fromJS(study));

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
          const { newFormData, entitySetName, studyId } = seqAction.value;
          const pageSection = get(newFormData, getPageSectionKey(1, 1));

          const participant = {
            [PERSON_ID.toString()]:
              [get(pageSection, getEntityAddressKey(0, entitySetName, PERSON_ID))],
            [OPENLATTICE_ID_FQN.toString()]:
              [get(pageSection, getEntityAddressKey(0, entitySetName, PERSON_ID))]
          };

          let participants = state.getIn(['participants', studyId], List());
          participants = participants.push(participant);

          return state
            .setIn([ADD_PARTICIPANT, 'requestState'], RequestStates.SUCCESS)
            .setIn(['participants', studyId], participants);
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

    // other action types here
    default:
      return state;
  }
}
