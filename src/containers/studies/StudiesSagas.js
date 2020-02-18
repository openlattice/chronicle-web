/*
 * @flow
 */

import uuid from 'uuid/v4';
import {
  all,
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
  setIn,
} from 'immutable';
import { Constants, Models, Types } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
  DataApiActions,
  DataApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas,
  PermissionsApiActions,
  PermissionsApiSagas,
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
  GET_STUDY_AUTHORIZATIONS,
  GET_STUDY_PARTICIPANTS,
  UPDATE_STUDY,
  addStudyParticipant,
  changeEnrollmentStatus,
  createNotificationsEntitySets,
  createParticipantsEntitySet,
  createStudy,
  deleteStudyParticipant,
  getParticipantsEnrollmentStatus,
  getStudies,
  getStudyAuthorizations,
  getStudyParticipants,
  updateParticipantsEntitySetPermissions,
  updateStudy
} from './StudiesActions';

import EnrollmentStatuses from '../../utils/constants/EnrollmentStatus';
import Logger from '../../utils/Logger';
import { selectEntityType, selectEntityTypeId } from '../../core/edm/EDMUtils';
import { ASSOCIATION_ENTITY_SET_NAMES, ENTITY_SET_NAMES } from '../../core/edm/constants/EntitySetNames';
import {
  ASSOCIATION_ENTITY_TYPE_FQNS,
  ENTITY_TYPE_FQNS,
  PROPERTY_TYPE_FQNS
} from '../../core/edm/constants/FullyQualifiedNames';
import { submitDataGraph, submitPartialReplace } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker, submitPartialReplaceWorker } from '../../core/sagas/data/DataSagas';
import {
  getNotificationsEntitySetName,
  getPartOfAssociationEntitySetName
} from '../../utils/NotificationsUtils';
import { getParticipantsEntitySetName } from '../../utils/ParticipantUtils';

const {
  deleteEntitiesAndNeighborsWorker,
  getEntitySetDataWorker,
  updateEntityDataWorker
} = DataApiSagas;

const {
  deleteEntitiesAndNeighbors,
  getEntitySetData,
  updateEntityData
} = DataApiActions;

const { createEntitySetsWorker, getEntitySetIdWorker } = EntitySetsApiSagas;
const { createEntitySets, getEntitySetId } = EntitySetsApiActions;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;
const { updateAcls } = PermissionsApiActions;
const { updateAclsWorker } = PermissionsApiSagas;
const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const { getAuthorizations } = AuthorizationsApiActions;

const {
  findEntityAddressKeyFromMap,
  getEntityAddressKey,
  getPageSectionKey,
  processEntityData,
  processEntityDataForPartialReplace,
  processAssociationEntityData,
  replaceEntityAddressKeys,
} = DataProcessingUtils;

const {
  AccessCheck,
  AccessCheckBuilder,
  Ace,
  AceBuilder,
  Acl,
  AclBuilder,
  AclData,
  AclDataBuilder,
  EntitySetBuilder,
  Principal,
  PrincipalBuilder,
} = Models;
const {
  ActionTypes,
  DeleteTypes,
  PermissionTypes,
  PrincipalTypes,
  UpdateTypes
} = Types;

const { OPENLATTICE_ID_FQN } = Constants;
const DEFAULT_USER_PRINCIPAL_ID = 'auth0|5ae9026c04eb0b243f1d2bb6';

const {
  CHRONICLE_STUDIES,
  APPLICATION_DATA,
  CHRONICLE_DEVICES,
  PREPROCESSED_DATA
} = ENTITY_SET_NAMES;

const {
  DATE_ENROLLED,
  DESCRIPTION,
  NOTIFICATION_ID,
  STATUS,
  STUDY_EMAIL,
  STUDY_ID,
  STUDY_NAME,
} = PROPERTY_TYPE_FQNS;

const { PART_OF } = ASSOCIATION_ENTITY_TYPE_FQNS;
const { PARTICIPATED_IN } = ASSOCIATION_ENTITY_SET_NAMES;
const { NOTIFICATION, PERSON } = ENTITY_TYPE_FQNS;
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

    const { studyId, participantEntityKeyId } = action.value;

    const participantsEntityName = getParticipantsEntitySetName(studyId);

    const {
      applicationDataEntitySetId,
      devicesEntitySetId,
      participantsEntitySetId,
      preprocessedDataEntitySetId
    } = yield select((state) => ({
      applicationDataEntitySetId: state.getIn(['edm', 'entitySetIds', APPLICATION_DATA]),
      devicesEntitySetId: state.getIn(['edm', 'entitySetIds', CHRONICLE_DEVICES]),
      participantsEntitySetId: state.getIn(['studies', 'participantEntitySetIds', participantsEntityName]),
      preprocessedDataEntitySetId: state.getIn(['edm', 'entitySetIds', PREPROCESSED_DATA]),
    }));

    const response = yield call(
      deleteEntitiesAndNeighborsWorker,
      deleteEntitiesAndNeighbors({
        entitySetId: participantsEntitySetId,
        filter: {
          entityKeyIds: [participantEntityKeyId],
          sourceEntitySetIds: [applicationDataEntitySetId, devicesEntitySetId, preprocessedDataEntitySetId]
        },
        deleteType: DeleteTypes.HARD
      })
    );
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

/*
 *
 * StudiesActions.updateStudy()
 *
 */

function* updateStudyWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(updateStudy.request(action.id));

    const { value } = action;
    const { formData, initialFormData, study } = value;

    const { entitySetIds, propertyTypeIds } = yield select((state) => ({
      entitySetIds: state.getIn(['edm', 'entitySetIds']),
      propertyTypeIds: state.getIn(['edm', 'propertyTypeIds']),
    }));

    const studyEKID :UUID = study.getIn([OPENLATTICE_ID_FQN, 0]);
    const entitySetId :UUID = entitySetIds.get(CHRONICLE_STUDIES);

    const entityIndexToIdMap :Map = Map()
      .setIn([CHRONICLE_STUDIES, 0], studyEKID);

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
    const studyEntityData = getIn(entityData, [entitySetId, 0]);

    yield put(updateStudy.success(action.id, studyEntityData));
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
 * StudiesActions.updateParticipantsEntitySetPermissions()
 *
 */

function* updateParticipantsEntitySetPermissionsWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse = {};
  try {
    yield put(updateParticipantsEntitySetPermissions.request(action.id));

    const participantsEntitySetId :UUID = action.value;

    const entityType = yield select(selectEntityType(PERSON));
    const updates :AclData[] = [];

    entityType.get('properties').forEach((propertyTypeId :UUID) => {

      const aclKey = [participantsEntitySetId, propertyTypeId];
      const permissions = [PermissionTypes.READ, PermissionTypes.WRITE];

      const principal :Principal = new PrincipalBuilder()
        .setId(DEFAULT_USER_PRINCIPAL_ID)
        .setType(PrincipalTypes.USER)
        .build();

      const ace :Ace = new AceBuilder()
        .setPermissions(permissions)
        .setPrincipal(principal)
        .build();

      const acl :Acl = new AclBuilder()
        .setAces([ace])
        .setAclKey(aclKey)
        .build();

      const aclData :AclData = new AclDataBuilder()
        .setAcl(acl)
        .setAction(ActionTypes.ADD)
        .build();
      updates.push(aclData);
    });

    const response = yield call(updateAclsWorker, updateAcls(updates));
    if (response.error) throw response.error;

    yield put(updateParticipantsEntitySetPermissions.success(action.id));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
  }
  finally {
    yield put(updateParticipantsEntitySetPermissions.finally(action.id));
  }

  return workerResponse;
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

    const newStudyData = action.value;
    const studyName = getIn(newStudyData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_NAME)]);
    const studyId = getIn(newStudyData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID)]);
    const email = getIn(newStudyData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_EMAIL)]);

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

    // update permissions
    const entitySetId = response.data[entitySet.name];
    response = yield call(
      updateParticipantsEntitySetPermissionsWorker,
      updateParticipantsEntitySetPermissions(entitySetId)
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
 * StudiesActions.getStudyAuthorizations()
 *
 */

function* getStudyAuthorizationsWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse = {};
  try {
    yield put(getStudyAuthorizations.request(action.id));

    const { studies, permissions } = action.value;

    const studyIds = studies.map((study) => study.getIn([STUDY_ID, 0]));
    const entitySetNames = studyIds.map((studyId) => getParticipantsEntitySetName(studyId));

    const responses :Object[] = yield all(
      entitySetNames.toJS().map((entitySetName) => call(getEntitySetIdWorker, getEntitySetId(entitySetName)))
    );

    // look up map: participant entity setIds -> study Ids
    const authorizedEntitySetIdsStudyIdMap :Map<UUID, UUID> = Map().withMutations((map :Map) => {
      responses.forEach((response, index) => {
        if (!response.error) {
          map.set(response.data, studyIds.get(index));
        }
      });
    });

    const accessChecks :AccessCheck[] = fromJS(authorizedEntitySetIdsStudyIdMap)
      .keySeq()
      .map((entitySetId) => (
        new AccessCheckBuilder()
          .setAclKey([entitySetId])
          .setPermissions(permissions)
          .build()
      ))
      .toJS();

    const response = yield call(getAuthorizationsWorker, getAuthorizations(accessChecks));
    if (response.error) throw response.error;
    const studyAuthorizations = response.data;

    const authorizedStudyIds :Set<UUID> = Set().withMutations((set :Set) => {
      studyAuthorizations.forEach((authorization) => {
        if (getIn(authorization, ['permissions', PermissionTypes.READ], false)) {
          const entitySetId = getIn(authorization, ['aclKey', 0]);
          set.add(authorizedEntitySetIdsStudyIdMap.get(entitySetId));
        }
      });
    });

    workerResponse.data = authorizedStudyIds;

    yield put(getStudyAuthorizations.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getStudyAuthorizations.failure(action.id));
  }
  finally {
    yield put(getStudyAuthorizations.finally(action.id));
  }
  return workerResponse;
}

function* getStudyAuthorizationsWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_STUDY_AUTHORIZATIONS, getStudyAuthorizations);
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

    const entitySetId = yield select(
      (state) => state.getIn(['edm', 'entitySetIds', CHRONICLE_STUDIES])
    );

    let response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId }));
    if (response.error) {
      throw response.error;
    }
    const studies = fromJS(response.data);

    response = yield call(
      getStudyAuthorizationsWorker,
      getStudyAuthorizations({ studies, permissions: [PermissionTypes.READ] })
    );
    if (response.error) throw response.error;
    const authorizedStudyIds = response.data;

    const authorizedStudies :Map<UUID, Map> = studies
      .toMap()
      .filter((study) => authorizedStudyIds.includes(study.getIn([STUDY_ID, 0])))
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

function* createNotificationsEntitySetsWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse = {};
  try {
    yield put(createNotificationsEntitySets.request(action.id));

    const formData = action.value;

    const studyName = getIn(formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_NAME)]);
    const studyId = getIn(formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID)]);
    const email = getIn(formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_EMAIL)]);

    // create ol.partof association
    const partOfEntityTypeId = yield select(selectEntityTypeId(PART_OF));
    const partOfEntitySetName = getPartOfAssociationEntitySetName(studyId);
    const partOfEntitySet = new EntitySetBuilder()
      .setContacts([email])
      .setDescription('Chronicle study part of Daily notification of User Awareness Questionnaire')
      .setEntityTypeId(partOfEntityTypeId)
      .setName(partOfEntitySetName)
      .setTitle(`${studyName} Part-Of Association`)
      .setOrganizationId(CAFE_ORGANIZATION_ID)
      .build();

    // create ol.notification entity
    const notificationEntityTypeId = yield select(selectEntityTypeId(NOTIFICATION));
    const notificationEntitySetName = getNotificationsEntitySetName(studyId);
    const notificationEntitySet = new EntitySetBuilder()
      .setContacts([email])
      .setDescription('Daily notification of User Awareness Questionnaire')
      .setEntityTypeId(notificationEntityTypeId)
      .setName(notificationEntitySetName)
      .setTitle(`${studyName} Daily Notification`)
      .setOrganizationId(CAFE_ORGANIZATION_ID)
      .build();

    const response = yield call(createEntitySetsWorker, createEntitySets([partOfEntitySet, notificationEntitySet]));
    if (response.error) throw response.error;

    workerResponse.data = response.data;

    yield put(createNotificationsEntitySets.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    workerResponse.error = error;
    yield put(createNotificationsEntitySets.failure(action.id));
  }
  finally {
    yield put(createNotificationsEntitySets.finally(action.id));
  }
  return workerResponse;
}

/*
 *
 * StudiesActions.createStudy()
 *
 */

function* createStudyWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(createStudy.request(action.id));

    let { value: formData } = action;

    // generate a random study id
    formData = setIn(
      formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID)],
      uuid(),
    );

    // create a new participant entity set for the new study
    let response = yield call(createParticipantsEntitySetWorker, createParticipantsEntitySet(formData));
    if (response.error) throw response.error;

    const { entitySetIds, propertyTypeIds } = yield select((state) => ({
      entitySetIds: state.getIn(['edm', 'entitySetIds']),
      propertyTypeIds: state.getIn(['edm', 'propertyTypeIds']),
    }));

    // create ol.partof -> ol.association entity sets
    response = yield call(createNotificationsEntitySetsWorker, createNotificationsEntitySets(formData));
    if (response.error) throw response.error;

    const notificationEntitySets = fromJS(response.data); // Map<string, UUID>

    // create associations
    const studyId = getIn(formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID)]);

    const notificationEntitySetName = getNotificationsEntitySetName(studyId);
    const partOfEntitySetName = getPartOfAssociationEntitySetName(studyId);

    const associations = [
      [partOfEntitySetName, 0, notificationEntitySetName, 0, CHRONICLE_STUDIES, {
        [NOTIFICATION_ID.toString()]: [studyId],
      }]
    ];

    const associationEntityData = processAssociationEntityData(
      fromJS(associations),
      entitySetIds.merge(notificationEntitySets),
      propertyTypeIds
    );

    // set description in notificationEntitySet
    formData = setIn(
      formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, notificationEntitySetName, DESCRIPTION)],
      'Daily notification of User Awareness Questionnaire',
    );

    let entityData = processEntityData(formData, entitySetIds.merge(notificationEntitySets), propertyTypeIds);

    response = yield call(submitDataGraphWorker, submitDataGraph({ associationEntityData, entityData }));
    if (response.error) throw response.error;

    const entitySetId :UUID = entitySetIds.get(CHRONICLE_STUDIES);
    const entityKeyId :UUID = getIn(response.data, ['entityKeyIds', entitySetId, 0]);

    // update the study entity with its entity key id
    formData = setIn(
      formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, OPENLATTICE_ID_FQN)],
      entityKeyId,
    );
    entityData = processEntityData(formData, entitySetIds, propertyTypeIds.map((id, fqn) => fqn));

    const studyEntityData = getIn(entityData, [entitySetId, 0]);
    yield put(createStudy.success(action.id, studyEntityData));
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
  getStudyAuthorizationsWatcher,
  updateStudyWatcher,
  updateStudyWorker,
};
