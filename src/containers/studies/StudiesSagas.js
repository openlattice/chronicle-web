/*
 * @flow
 */

import {
  call,
  delay,
  put,
  race,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  Set,
  fromJS,
  get,
  getIn,
  removeIn,
  setIn,
} from 'immutable';
import { Constants, Models, Types } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  DataApiActions,
  DataApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import { LangUtils, Logger } from 'lattice-utils';
import type { SequenceAction } from 'redux-reqseq';

import {
  ADD_PARTICIPANT,
  CHANGE_ENROLLMENT_STATUS,
  CREATE_PARTICIPANTS_ENTITY_SET,
  CREATE_STUDY,
  DELETE_STUDY_PARTICIPANT,
  GET_STUDIES,
  GET_STUDY_PARTICIPANTS,
  UPDATE_STUDY,
  addStudyParticipant,
  changeEnrollmentStatus,
  createParticipantsEntitySet,
  createStudy,
  deleteStudyParticipant,
  getGlobalNotificationsEKID,
  getParticipantsMetadata,
  getStudies,
  getStudyNotificationStatus,
  getStudyParticipants,
  updateStudy
} from './StudiesActions';

import EnrollmentStatuses from '../../utils/constants/EnrollmentStatus';
import * as ChronicleApi from '../../utils/api/ChronicleApi';
import { selectEntitySetId, selectEntityTypeId, selectPropertyTypeId } from '../../core/edm/EDMUtils';
import { ASSOCIATION_ENTITY_SET_NAMES, ENTITY_SET_NAMES } from '../../core/edm/constants/EntitySetNames';
import {
  ENTITY_TYPE_FQNS,
  PROPERTY_TYPE_FQNS
} from '../../core/edm/constants/FullyQualifiedNames';
import {
  getStudyAuthorizations,
  updateEntitySetPermissions
} from '../../core/permissions/PermissionsActions';
import {
  getStudyAuthorizationsWorker,
  updateEntitySetPermissionsWorker
} from '../../core/permissions/PermissionsSagas';
import { submitDataGraph, submitPartialReplace } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker, submitPartialReplaceWorker } from '../../core/sagas/data/DataSagas';
import { getParticipantsEntitySetName } from '../../utils/ParticipantUtils';
import { STUDIES_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const { createAssociations, getEntitySetData, updateEntityData } = DataApiActions;
const { createAssociationsWorker, getEntitySetDataWorker, updateEntityDataWorker } = DataApiSagas;
const { createEntitySets, getEntitySetId } = EntitySetsApiActions;
const { createEntitySetsWorker, getEntitySetIdWorker } = EntitySetsApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const {
  findEntityAddressKeyFromMap,
  getEntityAddressKey,
  getPageSectionKey,
  processAssociationEntityData,
  processEntityData,
  processEntityDataForPartialReplace,
  replaceEntityAddressKeys,
} = DataProcessingUtils;

const { EntitySetBuilder } = Models;
const { PermissionTypes, UpdateTypes } = Types;
const { isDefined } = LangUtils;

const { OPENLATTICE_ID_FQN } = Constants;

const {
  CHRONICLE_NOTIFICATIONS,
  CHRONICLE_STUDIES,
  CHRONICLE_METADATA,
} = ENTITY_SET_NAMES;

const { PARTICIPATED_IN, PART_OF_ES_NAME, HAS_ES_NAME } = ASSOCIATION_ENTITY_SET_NAMES;

const {
  DATE_ENROLLED,
  DATETIME_START_FQN,
  DATE_LOGGED,
  DATETIME_END_FQN,
  EVENT_COUNT,
  ID_FQN,
  NOTIFICATION_ENABLED,
  STATUS,
  STUDY_EMAIL,
  STUDY_ID,
  FULL_NAME_FQN,
} = PROPERTY_TYPE_FQNS;

const {
  GLOBAL_NOTIFICATIONS_EKID,
  PARTICIPATED_IN_EKID,
  PART_OF_ASSOCIATION_EKID_MAP,
  STUDIES,
} = STUDIES_REDUX_CONSTANTS;

const { PERSON } = ENTITY_TYPE_FQNS;
const { ENROLLED, NOT_ENROLLED } = EnrollmentStatuses;

const LOG = new Logger('StudiesSagas');
const CAFE_ORGANIZATION_ID = '7349c446-2acc-4d14-b2a9-a13be39cff93';

/*
 *
 * StudiesActions.changeEnrollmentStatus()
 *
 */

function* changeEnrollmentStatusWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(changeEnrollmentStatus.request(action.id));

    const { value } = action;
    const {
      enrollmentStatus,
      participantEntityKeyId,
      studyId,
    } = value;

    const newEnrollmentStatus = enrollmentStatus === ENROLLED ? NOT_ENROLLED : ENROLLED;
    const enrollmentDate = enrollmentStatus === ENROLLED ? null : new Date().toISOString();

    const {
      associationEntityKeyId,
      participatedInEntitySetId,
      statusPropertyTypeId,
      startDateTimePropertyTypeId
    } = yield select((state) => ({
      associationEntityKeyId:
        state.getIn(['studies', 'participants', studyId, participantEntityKeyId, PARTICIPATED_IN_EKID, 0]),
      participatedInEntitySetId: state.getIn(['edm', 'entitySetIds', PARTICIPATED_IN]),
      statusPropertyTypeId: state.getIn(['edm', 'propertyTypeIds', STATUS]),
      startDateTimePropertyTypeId: state.getIn(['edm', 'propertyTypeIds', DATE_ENROLLED])
    }));

    const response = yield call(updateEntityDataWorker, updateEntityData({
      entities: {
        [associationEntityKeyId]: {
          [statusPropertyTypeId]: [newEnrollmentStatus],
          [startDateTimePropertyTypeId]: [enrollmentDate]
        }
      },
      entitySetId: participatedInEntitySetId,
      updateType: UpdateTypes.PartialReplace
    }));

    if (response.error) throw response.error;

    yield put(changeEnrollmentStatus.success(action.id, {
      newEnrollmentStatus,
      enrollmentDate,
      participantEntityKeyId,
      studyId,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(changeEnrollmentStatus.failure(action.id));
  }
  finally {
    yield put(changeEnrollmentStatus.finally(action.id));
  }
}

function* changeEnrollmentStatusWatcher() :Generator<*, *, *> {
  yield takeEvery(CHANGE_ENROLLMENT_STATUS, changeEnrollmentStatusWorker);
}

/*
 *
 * StudiesActions.deleteStudyParticipant()
 *
 */

function* deleteStudyParticipantWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(deleteStudyParticipant.request(action.id));

    const { studyId, participantEntityKeyId, participantId } = action.value;

    const { response, timeout } = yield race({
      response: call(ChronicleApi.deleteStudyParticipant, participantId, studyId),
      timeout: delay(1000 * 10) // 10 seconds
    });
    if (response && response.error) throw response.error;

    yield put(deleteStudyParticipant.success(action.id, {
      participantEntityKeyId,
      studyId,
      timeout: isDefined(timeout)
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(deleteStudyParticipant.failure(action.id));
  }
  finally {
    yield put(deleteStudyParticipant.finally(action.id));
  }
}

function* deleteStudyParticipantWatcher() :Generator<*, *, *> {
  yield takeEvery(DELETE_STUDY_PARTICIPANT, deleteStudyParticipantWorker);
}

/*
 *
 * StudiesActions.getParticipantsMetadata()
 *
 */

function* getParticipantsMetadataWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse = {};
  try {
    yield put(getParticipantsMetadata.request(action.id));

    const { value } = action;
    const { participantEKIDs, participantsEntitySetId, participantsEntitySetName } = value;

    if (participantEKIDs.length) {
      const hasEntitySetId = yield select(
        (state) => state.getIn(['edm', 'entitySetIds', HAS_ES_NAME])
      );
      const metadataEntitySetId = yield select(
        (state) => state.getIn(['edm', 'entitySetIds', CHRONICLE_METADATA])
      );

      const searchFilter = {
        destinationEntitySetIds: [metadataEntitySetId],
        edgeEntitySetIds: [hasEntitySetId],
        entityKeyIds: participantEKIDs,
        sourceEntitySetIds: [participantsEntitySetId]
      };

      const response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: participantsEntitySetId,
          filter: searchFilter,
        })
      );
      if (response.error) throw response.error;

      // mapping from participantEntityKeyId -> enrollment status
      const metadata :Map = fromJS(response.data)
        .map((neighbors :List) => neighbors.first().get('neighborDetails'));
      workerResponse.data = metadata;

      // mapping from participantEntityKeyId -> association EKID
      const neighborKeyIds :Map = fromJS(response.data)
        .map((neighbors :List) => neighbors.first().getIn(['neighborDetails', OPENLATTICE_ID_FQN, 0]));

      yield put(getParticipantsMetadata.success(action.id, { neighborKeyIds, participantsEntitySetName }));
    }
    else {
      yield put(getParticipantsMetadata.success(action.id));
    }
  }
  catch (error) {
    LOG.error(action.type, error);
    workerResponse.error = error;
    yield put(getParticipantsMetadata.failure(action.id));
  }
  finally {
    yield put(getParticipantsMetadata.finally(action.id));
  }
  return workerResponse;
}

/*
 *
 * StudiesActions.getStudyParticipants()
 *
 */

function* getStudyParticipantsWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse = {};
  try {
    yield put(getStudyParticipants.request(action.id));

    const { studyEKID, studyId } = action.value;

    const participatedInESID = yield select(selectEntitySetId(PARTICIPATED_IN));
    const studyESID = yield select(selectEntitySetId(CHRONICLE_STUDIES));

    // get entity set id of participants entity set
    const participantsEntitySetName = getParticipantsEntitySetName(studyId);
    let response = {};

    response = yield call(getEntitySetIdWorker, getEntitySetId(participantsEntitySetName));
    if (response.error) throw response.error;
    const participantsEntitySetId = response.data;

    // filtered entity neighbor search on study entity set to get participants
    const searchFilter = {
      destinationEntitySetIds: [studyESID],
      edgeEntitySetIds: [participatedInESID],
      entityKeyIds: [studyEKID],
      sourceEntitySetIds: [participantsEntitySetId]
    };

    response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: studyESID,
        filter: searchFilter,
      })
    );
    if (response.error) throw response.error;

    const studyNeighbors :Object[] = get(response.data, studyEKID, []);
    const participantEKIDs = studyNeighbors.map((neighbor) => get(neighbor, 'neighborId'));

    // get participant metadata
    response = yield call(
      getParticipantsMetadataWorker,
      getParticipantsMetadata({ participantEKIDs, participantsEntitySetId, participantsEntitySetName })
    );
    const metadata :Map = response.data || Map();

    // construct participant entities
    const participants = studyNeighbors.reduce((result, neighbor) => {
      const participantEKID = get(neighbor, 'neighborId');

      // metadata
      const datesLogged = metadata.getIn([participantEKID, DATE_LOGGED], List());
      const count :number = datesLogged.count();
      const countValue = count === 0 ? '---' : count;

      const participant = {
        ...get(neighbor, 'neighborDetails'),
        [DATE_ENROLLED.toString()]: metadata.getIn([participantEKID, DATE_ENROLLED]),
        [DATETIME_START_FQN.toString()]: metadata.getIn([participantEKID, DATETIME_START_FQN]),
        [DATETIME_END_FQN.toString()]: metadata.getIn([participantEKID, DATETIME_END_FQN]),
        [EVENT_COUNT.toString()]: [countValue],
        [PARTICIPATED_IN_EKID]: getIn(neighbor, ['associationDetails', OPENLATTICE_ID_FQN]),
        [STATUS.toString()]: getIn(neighbor, ['associationDetails', STATUS], [ENROLLED]),
        id: [participantEKID], // needed by LUK table
      };
      // eslint-disable-next-line
      result[participantEKID] = participant;
      return result;
    }, {});

    yield put(getStudyParticipants.success(action.id, {
      participants: fromJS(participants),
      participantsEntitySetId,
      participantsEntitySetName,
      studyId,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    workerResponse.error = error;
    yield put(getStudyParticipants.failure(action.id));
  }
  finally {
    yield put(getStudyParticipants.finally(action.id));
  }
  return workerResponse;
}

function* getStudyParticipantsWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_STUDY_PARTICIPANTS, getStudyParticipantsWorker);
}

function* associateExistingStudyWithNotifications(studyId, studyEntityKeyId) :Generator<*, *, *> {
  const workerResponse = {};
  try {
    const studyEntitySetId = yield select(selectEntitySetId(CHRONICLE_STUDIES));
    const partOfEntitySetId = yield select(selectEntitySetId(PART_OF_ES_NAME));
    const notificationsEntitySetId = yield select(selectEntitySetId(CHRONICLE_NOTIFICATIONS));

    const IdFQNPropertyTypeId = yield select(selectPropertyTypeId(ID_FQN));
    const globalNotificationsEKID = yield select((state) => state.getIn([STUDIES, GLOBAL_NOTIFICATIONS_EKID]));

    const associations = {
      [partOfEntitySetId]: [{
        data: {
          [IdFQNPropertyTypeId]: [studyId]
        },
        dst: {
          entitySetId: studyEntitySetId,
          entityKeyId: studyEntityKeyId
        },
        src: {
          entitySetId: notificationsEntitySetId,
          entityKeyId: globalNotificationsEKID
        }
      }]
    };
    const response = yield call(createAssociationsWorker, createAssociations(associations));
    if (response.error) throw response.error;

    workerResponse.data = getIn(response.data, [partOfEntitySetId, 0]);
  }
  catch (error) {
    workerResponse.error = error;
  }
  return workerResponse;
}

/*
 *
 * StudiesActions.updateStudy()
 *
 */

function* updateStudyWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(updateStudy.request(action.id));

    const { value } = action;
    const { study } = value;
    let { formData, initialFormData } = value;

    const studyId :UUID = study.getIn([STUDY_ID, 0]);
    const studyEntityKeyId :UUID = study.getIn([OPENLATTICE_ID_FQN, 0]);

    let partOfEntityKeyId = yield select(
      (state) => state.getIn([STUDIES, PART_OF_ASSOCIATION_EKID_MAP, studyId])
    );

    const { entitySetIds, propertyTypeIds } = yield select((state) => ({
      entitySetIds: state.getIn(['edm', 'entitySetIds']),
      propertyTypeIds: state.getIn(['edm', 'propertyTypeIds']),
    }));

    // STEP 1: create notifications -> partof -> study association if it doesnt exist
    const notificationsEnabled = getIn(formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, NOTIFICATION_ENABLED)]);

    const partOfAssociationVal = notificationsEnabled ? studyId : null;

    if (!partOfEntityKeyId) {
      const response = yield call(associateExistingStudyWithNotifications, partOfAssociationVal, studyEntityKeyId);
      if (response.error) throw response.error;
      partOfEntityKeyId = response.data;
    }
    else {
      formData = setIn(formData,
        [getPageSectionKey(1, 1), getEntityAddressKey(
          partOfEntityKeyId, PART_OF_ES_NAME, ID_FQN
        )], partOfAssociationVal);
    }

    // remove notification_enabled property since it is not a part of chronicle_studies entity set
    formData = removeIn(formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, NOTIFICATION_ENABLED)]);

    initialFormData = removeIn(initialFormData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, NOTIFICATION_ENABLED)]);

    // Step 2: update study details
    const entityIndexToIdMap :Map = Map()
      .setIn([CHRONICLE_STUDIES, 0], studyEntityKeyId)
      .setIn([PART_OF_ES_NAME, 0], partOfEntityKeyId);

    const draftWithKeys = replaceEntityAddressKeys(
      formData,
      findEntityAddressKeyFromMap(entityIndexToIdMap)
    );

    const originalWithKeys = replaceEntityAddressKeys(
      initialFormData,
      findEntityAddressKeyFromMap(entityIndexToIdMap)
    );

    let entityData = processEntityDataForPartialReplace(
      draftWithKeys,
      originalWithKeys,
      entitySetIds,
      propertyTypeIds,
      {}
    );

    const response = yield call(submitPartialReplaceWorker, submitPartialReplace({ entityData }));
    if (response.error) throw response.error;

    // construct updated study
    entityData = processEntityData(formData, entitySetIds, propertyTypeIds.map((id, fqn) => fqn));

    const entitySetId :UUID = entitySetIds.get(CHRONICLE_STUDIES);
    const studyEntityData = getIn(entityData, [entitySetId, 0]);

    // update notifications : set entity set ids, and association key id

    yield put(updateStudy.success(action.id, {
      notificationsEnabled,
      partOfEntityKeyId,
      studyEntityData,
      studyId,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(updateStudy.failure(action.id));
  }
  finally {
    yield put(updateStudy.finally(action.id));
  }
}

function* updateStudyWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_STUDY, updateStudyWorker);
}

/*
 *
 * StudiesActions.createParticipantsEntitySet()
 *
 */

function* createParticipantsEntitySetWorker(action :SequenceAction) :Generator<*, *, *> {

  const workerResponse = {};

  try {
    yield put(createParticipantsEntitySet.request(action.id));

    const { studyId, email, studyName } = action.value;

    const entityTypeId :UUID = yield select(selectEntityTypeId(PERSON));

    const entitySet = new EntitySetBuilder()
      .setContacts([email])
      .setDescription(`Participants of study with name ${studyName} and id ${studyId}`)
      .setEntityTypeId(entityTypeId)
      .setName(getParticipantsEntitySetName(studyId))
      .setTitle(`${studyName} Participants`)
      .setOrganizationId(CAFE_ORGANIZATION_ID)
      .build();

    let response = yield call(createEntitySetsWorker, createEntitySets([entitySet]));
    if (response.error) throw response.error;

    // set read/write permissions for chronicle super user
    const entitySetId = response.data[entitySet.name];
    response = yield call(
      updateEntitySetPermissionsWorker,
      updateEntitySetPermissions({
        entitySetId,
        entityTypeFQN: PERSON
      })
    );
    if (response.error) throw response.error;

    const responseObj = {
      entitySetName: entitySet.name,
      entitySetId
    };
    yield put(createParticipantsEntitySet.success(action.id, responseObj));

  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(error.type, error);
    yield put(createParticipantsEntitySet.failure(action.id, error));
  }
  finally {
    yield put(createParticipantsEntitySet.finally(action.id));
  }

  return workerResponse;
}

function* createParticipantsEntitySetWatcher() :Generator<*, *, *> {
  yield takeEvery(CREATE_PARTICIPANTS_ENTITY_SET, createParticipantsEntitySetWorker);
}

/*
 *
 * StudiesActions.addStudyParticipant()
 *
 */

function* addStudyParticipantWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(addStudyParticipant.request(action.id));

    const { value } = action;
    const { studyId, studyEntityKeyId } = value;
    let { formData } = value;

    let entitySetIds = yield select((state) => state.getIn(['edm', 'entitySetIds']));
    const { participantEntitySetIds, propertyTypeIds } = yield select((state) => ({
      participantEntitySetIds: state.getIn(['studies', 'participantEntitySetIds']),
      propertyTypeIds: state.getIn(['edm', 'propertyTypeIds']),
    }));
    entitySetIds = entitySetIds.merge(participantEntitySetIds);

    const participantsEntitySetName = getParticipantsEntitySetName(studyId);
    const participantsEntitySetId = participantEntitySetIds.get(participantsEntitySetName);

    const dateEnrolled = new Date().toISOString();
    const associations = [
      [PARTICIPATED_IN, 0, participantsEntitySetName, studyEntityKeyId, CHRONICLE_STUDIES, {
        [STATUS.toString()]: [ENROLLED],
        [DATE_ENROLLED.toString()]: [dateEnrolled]
      }]
    ];
    let entityData = processEntityData(formData, entitySetIds, propertyTypeIds);
    const associationEntityData = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);

    const response = yield call(submitDataGraphWorker, submitDataGraph({ entityData, associationEntityData }));
    if (response.error) throw response.error;

    // get association entityKeyId
    const participatedInEntitySetId = entitySetIds.get(PARTICIPATED_IN);
    const participatedInEntityKeyId = getIn(response.data, ['entitySetIds', participatedInEntitySetId, 0]);

    // reconstruct created entity
    const participantEntityKeyId = getIn(response.data, ['entityKeyIds', participantsEntitySetId, 0]);
    formData = setIn(
      formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, participantsEntitySetName, OPENLATTICE_ID_FQN)],
      participantEntityKeyId
    );
    entityData = processEntityData(formData, entitySetIds, propertyTypeIds.map((id, fqn) => fqn));

    let participantEntityData = fromJS(getIn(entityData, [participantsEntitySetId, 0]));
    participantEntityData = participantEntityData
      .set(STATUS, [ENROLLED])
      .set(EVENT_COUNT, ['---'])
      .set(PARTICIPATED_IN_EKID, [participatedInEntityKeyId])
      .set('id', [participantEntityKeyId]);

    yield put(addStudyParticipant.success(action.id, {
      participantEntityData,
      participantEntityKeyId,
      studyId
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(addStudyParticipant.failure(action.id, error));
  }
  finally {
    yield put(addStudyParticipant.finally(action.id));
  }
}

function* addStudyParticipantWatcher() :Generator<*, *, *> {
  yield takeEvery(ADD_PARTICIPANT, addStudyParticipantWorker);
}

/*
 *
 * StudiesActions.getStudyNotificationStatus()
 *
 */

function* getStudyNotificationStatusWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse = {};

  try {
    yield put(getStudyNotificationStatus.request(action.id));

    const {
      studiesEntitySetId,
      studies
    } = action.value;

    const studyEntityKeyIds = studies.map((study) => study.getIn([OPENLATTICE_ID_FQN, 0]));

    const notificationsEntitySetId = yield select(selectEntitySetId(CHRONICLE_NOTIFICATIONS));
    const partOfEntitySetId = yield select(selectEntitySetId(PART_OF_ES_NAME));

    const searchFilter = {
      destinationEntitySetIds: [studiesEntitySetId],
      edgeEntitySetIds: [partOfEntitySetId],
      entityKeyIds: studyEntityKeyIds.toArray(),
      sourceEntitySetIds: [notificationsEntitySetId]
    };

    const response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: studiesEntitySetId,
        filter: searchFilter
      })
    );
    if (response.error) throw response.error;

    const studiesWithNotifications = Set().asMutable();
    const associationEKIDMap = Map().asMutable();

    studies.forEach((study) => {
      const entityKeyId = study.getIn([OPENLATTICE_ID_FQN, 0]);
      const studyId = study.getIn([STUDY_ID, 0]);

      const associationDetails = getIn(response.data, [entityKeyId, 0, 'associationDetails'], {});
      associationEKIDMap.set(studyId, getIn(associationDetails, [OPENLATTICE_ID_FQN, 0]));

      if (getIn(associationDetails, [ID_FQN, 0]) === studyId) {
        studiesWithNotifications.add(studyId);
      }
    });

    yield put(getStudyNotificationStatus.success(action.id, {
      studiesWithNotifications: studiesWithNotifications.asImmutable(),
      associationEKIDMap: associationEKIDMap.asImmutable()
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    yield put(getStudyNotificationStatus.failure(action.id));
  }
  return workerResponse;
}

/*
 *
 * StudiesActions.getStudies()
 *
 */

function* getStudiesWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse = {};
  try {
    yield put(getStudies.request(action.id));

    const studiesEntitySetId = yield select(selectEntitySetId(CHRONICLE_STUDIES));

    let response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: studiesEntitySetId }));
    if (response.error) {
      throw response.error;
    }
    const studies = fromJS(response.data).filter((study) => study.getIn([STUDY_ID, 0]));

    response = yield call(
      getStudyAuthorizationsWorker,
      getStudyAuthorizations({ studies, permissions: [PermissionTypes.READ] })
    );
    if (response.error) throw response.error;
    const authorizedStudyIds = response.data;

    let authorizedStudies :Map<UUID, Map> = studies
      .filter((study) => authorizedStudyIds.includes(study.getIn([STUDY_ID, 0])));

    // get notification status for authorized studies
    if (!authorizedStudies.isEmpty()) {
      response = yield call(getStudyNotificationStatusWorker, getStudyNotificationStatus({
        studiesEntitySetId,
        studies: authorizedStudies
      }));
      if (response.error) throw response.error;
    }

    authorizedStudies = authorizedStudies
      .toMap()
      .mapKeys((index :number, study :Map) => study.getIn([STUDY_ID, 0]));

    yield put(getStudies.success(action.id, authorizedStudies));
  }
  catch (error) {
    LOG.error(action.type, error);
    workerResponse.error = error;
    yield put(getStudies.failure(action.id, error));
  }
  finally {
    yield put(getStudies.finally(action.id));
  }
  return workerResponse;
}

function* getStudiesWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_STUDIES, getStudiesWorker);
}

/*
 *
 * StudiesActions.createStudy()
 *
 */

function* createStudyWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(createStudy.request(action.id));

    const { value } = action;

    let { formData } = value;
    const { studyId } = value;

    const { entitySetIds, propertyTypeIds } = yield select((state) => ({
      entitySetIds: state.getIn(['edm', 'entitySetIds']),
      propertyTypeIds: state.getIn(['edm', 'propertyTypeIds']),
    }));

    const globalNotificationsEKID = yield select((state) => state.getIn([STUDIES, GLOBAL_NOTIFICATIONS_EKID]));

    // create a new participant entity set for the new study
    let response = yield call(createParticipantsEntitySetWorker, createParticipantsEntitySet({
      studyId,
      email: getIn(formData,
        [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_EMAIL)]),
      studyName: getIn(formData,
        [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, FULL_NAME_FQN)])
    }));
    if (response.error) throw response.error;

    // generate a random study id
    formData = setIn(
      formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID)],
      studyId,
    );

    const notificationsEnabled = getIn(formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, NOTIFICATION_ENABLED)]);

    // remove notification_enabled property since it's not part of chronicle_studies entity set
    formData = removeIn(
      formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, NOTIFICATION_ENABLED)]
    );

    // create notification -> partof -> study association
    let associations = [];
    if (notificationsEnabled) {
      associations = [
        [PART_OF_ES_NAME, globalNotificationsEKID, CHRONICLE_NOTIFICATIONS, 0, CHRONICLE_STUDIES, {
          [ID_FQN.toString()]: [studyId],
        }]
      ];
    }

    const associationEntityData = processAssociationEntityData(
      fromJS(associations),
      entitySetIds,
      propertyTypeIds
    );

    let entityData = processEntityData(
      formData,
      entitySetIds,
      propertyTypeIds
    );

    response = yield call(submitDataGraphWorker, submitDataGraph({ associationEntityData, entityData }));
    if (response.error) throw response.error;

    const studyEntitySetId :UUID = entitySetIds.get(CHRONICLE_STUDIES);
    const studyEntityKeyId :UUID = getIn(response.data, ['entityKeyIds', studyEntitySetId, 0]);
    const partOfEntityKeyId :UUID = getIn(response.data, ['entitySetIds', PART_OF_ES_NAME, 0]);

    // reconstruct the created study
    // update the study entity with its entity key id
    formData = setIn(
      formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, OPENLATTICE_ID_FQN)],
      studyEntityKeyId,
    );
    entityData = processEntityData(formData, entitySetIds, propertyTypeIds.map((id, fqn) => fqn));

    const studyEntityData = getIn(entityData, [studyEntitySetId, 0]);

    yield put(createStudy.success(action.id, {
      notificationsEnabled,
      partOfEntityKeyId,
      studyEntityData,
      studyId,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(createStudy.failure(action.id, error));
  }
  finally {
    yield put(createStudy.finally(action.id));
  }
}

function* createStudyWatcher() :Generator<*, *, *> {
  yield takeEvery(CREATE_STUDY, createStudyWorker);
}

/*
 *
 * StudiesActions.getGlobalNotificationsEKID()
 *
 */

function* getGlobalNotificationsEKIDWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse = {};
  try {
    yield put(getGlobalNotificationsEKID.request(action.id));

    const entitySetId = yield select(selectEntitySetId(CHRONICLE_NOTIFICATIONS));

    const response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId }));
    if (response.error) throw response.error;

    const entityKeyId = getIn(response.data, [0, OPENLATTICE_ID_FQN, 0]);
    if (!entityKeyId) throw new Error('No entity found in notifications entity set');

    yield put(getGlobalNotificationsEKID.success(action.id, entityKeyId));
  }
  catch (error) {
    workerResponse.error = error;
    yield put(getGlobalNotificationsEKID.failure(action.id));
  }
  finally {
    yield put(getGlobalNotificationsEKID.finally(action.id));
  }

  return workerResponse;
}

export {
  addStudyParticipantWatcher,
  addStudyParticipantWorker,
  changeEnrollmentStatusWatcher,
  createParticipantsEntitySetWatcher,
  createParticipantsEntitySetWorker,
  createStudyWatcher,
  deleteStudyParticipantWatcher,
  getParticipantsMetadataWorker,
  getStudiesWatcher,
  getStudiesWorker,
  getStudyParticipantsWatcher,
  updateStudyWatcher,
  updateStudyWorker,
  getGlobalNotificationsEKIDWorker
};
