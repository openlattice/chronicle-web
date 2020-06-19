/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  Set,
  fromJS,
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
  UPDATE_STUDY,
  addStudyParticipant,
  changeEnrollmentStatus,
  createParticipantsEntitySet,
  createStudy,
  deleteStudyParticipant,
  getGlobalNotificationsEKID,
  getParticipantsEnrollmentStatus,
  getStudies,
  getStudyNotificationStatus,
  getStudyParticipants,
  updateStudy
} from './StudiesActions';

import EnrollmentStatuses from '../../utils/constants/EnrollmentStatus';
import Logger from '../../utils/Logger';
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
import { STUDIES_REDUCER_CONSTANTS } from '../../utils/constants/ReduxConstants';

const {
  getEntitySetDataWorker,
  updateEntityDataWorker,
  createAssociationsWorker,
} = DataApiSagas;

const {
  getEntitySetData,
  updateEntityData,
  createAssociations
} = DataApiActions;

const { createEntitySetsWorker, getEntitySetIdWorker } = EntitySetsApiSagas;
const { createEntitySets, getEntitySetId } = EntitySetsApiActions;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

const {
  findEntityAddressKeyFromMap,
  getEntityAddressKey,
  getPageSectionKey,
  processEntityData,
  processEntityDataForPartialReplace,
  processAssociationEntityData,
  replaceEntityAddressKeys,
} = DataProcessingUtils;

const { EntitySetBuilder } = Models;
const { PermissionTypes, UpdateTypes } = Types;

const { OPENLATTICE_ID_FQN } = Constants;

const { CHRONICLE_NOTIFICATIONS, CHRONICLE_STUDIES } = ENTITY_SET_NAMES;

const { PARTICIPATED_IN, CHRONICLE_PARTOF } = ASSOCIATION_ENTITY_SET_NAMES;

const {
  DATE_ENROLLED,
  ID_FQN,
  NOTIFICATION_ENABLED,
  NOTIFICATION_ID,
  STATUS,
  STUDY_EMAIL,
  STUDY_ID,
  STUDY_NAME,
} = PROPERTY_TYPE_FQNS;

const {
  GLOBAL_NOTIFICATIONS_EKID,
  PART_OF_ASSOCIATION_EKID_MAP,
  STUDIES,
} = STUDIES_REDUCER_CONSTANTS;

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

    const participantsEntitySetName = getParticipantsEntitySetName(studyId);
    const newEnrollmentStatus = enrollmentStatus === ENROLLED ? NOT_ENROLLED : ENROLLED;
    const enrollmentDate = enrollmentStatus === ENROLLED ? null : new Date().toISOString();

    const {
      associationEntityKeyId,
      participatedInEntitySetId,
      statusPropertyTypeId,
      startDateTimePropertyTypeId
    } = yield select((state) => ({
      associationEntityKeyId:
        state.getIn(['studies', 'associationKeyIds', participantsEntitySetName, participantEntityKeyId]),
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

    const response = yield call(ChronicleApi.deleteStudyParticipant, participantId, studyId);
    if (response.error) throw response.error;

    yield put(deleteStudyParticipant.success(action.id, {
      participantEntityKeyId,
      studyId
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
 * StudiesActions.getParticipantsEnrollmentStatus()
 *
 */

function* getParticipantsEnrollmentStatusWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse = {};
  try {
    yield put(getParticipantsEnrollmentStatus.request(action.id));

    const { value } = action;
    const { participants, participantsEntitySetId, participantsEntitySetName } = value;

    if (!participants.isEmpty()) {
      const participatedInEntitySetId = yield select(
        (state) => state.getIn(['edm', 'entitySetIds', PARTICIPATED_IN])
      );
      const studiesEntitySetId = yield select(
        (state) => state.getIn(['edm', 'entitySetIds', CHRONICLE_STUDIES])
      );
      const participantsEntityKeyIds = participants.keySeq().toJS();

      const searchFilter = {
        destinationEntitySetIds: [studiesEntitySetId],
        edgeEntitySetIds: [participatedInEntitySetId],
        entityKeyIds: participantsEntityKeyIds,
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
      const enrollmentStatus :Map = fromJS(response.data)
        .map((associations :List) => associations.first().get('associationDetails'));
      workerResponse.data = enrollmentStatus;

      // mapping from participantEntityKeyId -> association EKID
      const associationKeyIds :Map = fromJS(response.data)
        .map((associations :List) => associations.first().getIn(['associationDetails', OPENLATTICE_ID_FQN, 0]));

      yield put(getParticipantsEnrollmentStatus.success(action.id, { associationKeyIds, participantsEntitySetName }));
    }
    else {
      yield put(getParticipantsEnrollmentStatus.success(action.id));
    }
  }
  catch (error) {
    LOG.error(action.type, error);
    workerResponse.error = error;
    yield put(getParticipantsEnrollmentStatus.failure(action.id));
  }
  finally {
    yield put(getParticipantsEnrollmentStatus.finally(action.id));
  }
  return workerResponse;
}

function* getParticipantsEnrollmentStatusWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_PARTICIPANTS_ENROLLMENT, getParticipantsEnrollmentStatusWorker);
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

    const studyId = action.value;

    const participantsEntitySetName = getParticipantsEntitySetName(studyId);
    let response = {};

    response = yield call(getEntitySetIdWorker, getEntitySetId(participantsEntitySetName));
    if (response.error) throw response.error;
    const participantsEntitySetId = response.data;

    response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: participantsEntitySetId }));
    if (response.error) throw response.error;

    let participants = fromJS(response.data)
      .toMap()
      .mapKeys((index, participant) => participant.getIn([OPENLATTICE_ID_FQN, 0]));

    // get enrollment status
    response = yield call(
      getParticipantsEnrollmentStatusWorker,
      getParticipantsEnrollmentStatus({ participants, participantsEntitySetId, participantsEntitySetName })
    );
    if (response.error) throw response.error;
    const enrollmentStatus :Map = response.data;

    // update participants with enrollment status
    participants = participants.map((participant, id) => participant
      .set(STATUS, [enrollmentStatus.getIn([id, STATUS, 0], ENROLLED)])
      .set(DATE_ENROLLED, [enrollmentStatus.getIn([id, DATE_ENROLLED, 0])])
      .set('id', [id])); // required by LUK table

    yield put(getStudyParticipants.success(action.id, {
      participants,
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
    const partOfEntitySetId = yield select(selectEntitySetId(CHRONICLE_PARTOF));
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
          partOfEntityKeyId, CHRONICLE_PARTOF, ID_FQN
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
      .setIn([CHRONICLE_PARTOF, 0], partOfEntityKeyId);

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
      .set(DATE_ENROLLED, [dateEnrolled])
      .set('id', [participantEntityKeyId]); // required by LUK table

    yield put(addStudyParticipant.success(action.id, {
      participantEntityData,
      participantEntityKeyId,
      participantsEntitySetName,
      participatedInEntityKeyId,
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
    const partOfEntitySetId = yield select(selectEntitySetId(CHRONICLE_PARTOF));

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
        [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_NAME)])
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
        [CHRONICLE_PARTOF, globalNotificationsEKID, CHRONICLE_NOTIFICATIONS, 0, CHRONICLE_STUDIES, {
          [NOTIFICATION_ID.toString()]: [studyId],
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
    const partOfEntityKeyId :UUID = getIn(response.data, ['entitySetIds', CHRONICLE_PARTOF, 0]);

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
  getParticipantsEnrollmentStatusWatcher,
  getParticipantsEnrollmentStatusWorker,
  getStudiesWatcher,
  getStudiesWorker,
  getStudyParticipantsWatcher,
  updateStudyWatcher,
  updateStudyWorker,
  getGlobalNotificationsEKIDWorker
};
