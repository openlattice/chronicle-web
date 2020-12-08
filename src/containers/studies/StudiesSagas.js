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
import { Constants, Types } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  DataApiActions,
  DataApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import { DataUtils, LangUtils, Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  ADD_PARTICIPANT,
  CHANGE_ENROLLMENT_STATUS,
  CREATE_STUDY,
  DELETE_STUDY_PARTICIPANT,
  GET_STUDIES,
  GET_STUDY_PARTICIPANTS,
  UPDATE_STUDY,
  addStudyParticipant,
  changeEnrollmentStatus,
  createStudy,
  deleteStudyParticipant,
  getNotificationsEntity,
  getParticipantsMetadata,
  getStudies,
  getStudyNotificationStatus,
  getStudyParticipants,
  getTimeUseDiaryStudies,
  updateStudy
} from './StudiesActions';
import { constructEntityFromFormData } from './utils';

import EnrollmentStatuses from '../../utils/constants/EnrollmentStatus';
import * as AppModules from '../../utils/constants/AppModules';
import * as ChronicleApi from '../../utils/api/ChronicleApi';
import {
  getSelectedOrgEntitySetIds,
  selectESIDByCollection,
  selectEntitySetsByModule,
  selectPropertyTypeId,
  selectPropertyTypeIds
} from '../../core/edm/EDMUtils';
import {
  HAS,
  METADATA,
  NOTIFICATION,
  PARTICIPANTS,
  PARTICIPATED_IN,
  PART_OF,
  STUDIES,
  SURVEY
} from '../../core/edm/constants/EntityTemplateNames';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { submitDataGraph, submitPartialReplace } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker, submitPartialReplaceWorker } from '../../core/sagas/data/DataSagas';
import { APP_REDUX_CONSTANTS, STUDIES_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const { createAssociations, getEntitySetData, updateEntityData } = DataApiActions;
const { createAssociationsWorker, getEntitySetDataWorker, updateEntityDataWorker } = DataApiSagas;
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

const { UpdateTypes } = Types;
const { isDefined } = LangUtils;
const { getEntityKeyId } = DataUtils;

const { OPENLATTICE_ID_FQN } = Constants;

const {
  DATE_ENROLLED,
  DATETIME_START_FQN,
  DATE_LOGGED,
  DATETIME_END_FQN,
  DESCRIPTION_FQN,
  EVENT_COUNT,
  ID_FQN,
  NOTIFICATION_ENABLED,
  STATUS,
  STUDY_ID,
} = PROPERTY_TYPE_FQNS;

const {
  NOTIFICATIONS_EKID,
  PARTICIPATED_IN_EKID,
  PART_OF_ASSOCIATION_EKID_MAP,
} = STUDIES_REDUX_CONSTANTS;

const {
  ORGS,
  SELECTED_ORG_ID
} = APP_REDUX_CONSTANTS;

const { ENROLLED, NOT_ENROLLED } = EnrollmentStatuses;

const LOG = new Logger('StudiesSagas');
const TIME_USE_DIARY = 'Time Use Diary';

function* getTimeUseDiaryStudiesWorker(action :SequenceAction) :Saga<*> {
  const workerResponse = {};
  try {
    yield put(getTimeUseDiaryStudies.request(action.id));
    const studyEntityKeyIds = action.value;

    // entity set ids
    const chronicleEntitySetIds = yield select(selectEntitySetsByModule(AppModules.CHRONICLE_CORE));
    const surveyEntitySetIds = yield select(selectEntitySetsByModule(AppModules.QUESTIONNAIRES));

    const partOfESID = chronicleEntitySetIds.get(PART_OF);
    const studyESID = chronicleEntitySetIds.get(STUDIES);
    const surveyESID = surveyEntitySetIds.get(SURVEY);

    // since SURVEYS module is optional, surveyESID will be undefined if currently
    // selected organization hasn't installed module
    if (!surveyESID) {
      yield put(getTimeUseDiaryStudies.success(action.id, Set()));
      return workerResponse;
    }

    // filtered search on study dataset to get survey neighbors
    const searchFilter = {
      destinationEntitySetIds: [],
      edgeEntitySetIds: [partOfESID],
      entityKeyIds: studyEntityKeyIds,
      sourceEntitySetIds: [surveyESID]
    };

    const response = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId: studyESID,
        filter: searchFilter,
      })
    );
    if (response.error) throw response.error;

    const timeUseDiaryStudies = Set().withMutations((mutator) => {
      fromJS(response.data).forEach((neighbors, studyEKID) => {
        if (neighbors.find((neighbor) => getIn(neighbor, ['neighborDetails', ID_FQN, 0], '') === TIME_USE_DIARY)) {
          mutator.add(studyEKID);
        }
      });
    });

    yield put(getTimeUseDiaryStudies.success(action.id, timeUseDiaryStudies));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
  }
  finally {
    yield put(getTimeUseDiaryStudies.finally(action.id));
  }

  return workerResponse;
}

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

    // get entity set ids and property types
    const participatedInESID = yield select(selectESIDByCollection(PARTICIPATED_IN, AppModules.CHRONICLE_CORE));
    const statusPTID = yield select(selectPropertyTypeId(STATUS));
    const datePTID = yield select(selectPropertyTypeId(DATE_ENROLLED));

    const participatedInEKID = yield select(
      (state) => state.getIn(['studies', 'participants', studyId, participantEntityKeyId, PARTICIPATED_IN_EKID, 0])
    );

    const response = yield call(updateEntityDataWorker, updateEntityData({
      entities: {
        [participatedInEKID]: {
          [statusPTID]: [newEnrollmentStatus],
          [datePTID]: [enrollmentDate]
        }
      },
      entitySetId: participatedInESID,
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
    const selectedOrgId :UUID = yield select((state) => state.getIn(['app', SELECTED_ORG_ID]));

    const { response, timeout } = yield race({
      response: call(ChronicleApi.deleteStudyParticipant, selectedOrgId, participantId, studyId),
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
    const { participantEKIDs, participantsESID } = value;

    // get entity sets
    const hasESID = yield select(selectESIDByCollection(HAS, AppModules.CHRONICLE_CORE));
    const metadataESID = yield select(selectESIDByCollection(METADATA, AppModules.CHRONICLE_CORE));

    if (participantEKIDs.length) {
      const searchFilter = {
        destinationEntitySetIds: [metadataESID],
        edgeEntitySetIds: [hasESID],
        entityKeyIds: participantEKIDs,
        sourceEntitySetIds: [participantsESID]
      };

      const response = yield call(
        searchEntityNeighborsWithFilterWorker,
        searchEntityNeighborsWithFilter({
          entitySetId: participantsESID,
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

      yield put(getParticipantsMetadata.success(action.id, { neighborKeyIds }));
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

    // get entity set ids
    const participatedInESID = yield select(selectESIDByCollection(PARTICIPATED_IN, AppModules.CHRONICLE_CORE));
    const studyESID = yield select(selectESIDByCollection(STUDIES, AppModules.CHRONICLE_CORE));
    const participantsESID = yield select(selectESIDByCollection(PARTICIPANTS, AppModules.CHRONICLE_CORE));

    // filtered entity neighbor search on study entity set to get participants
    const searchFilter = {
      destinationEntitySetIds: [studyESID],
      edgeEntitySetIds: [participatedInESID],
      entityKeyIds: [studyEKID],
      sourceEntitySetIds: [participantsESID]
    };

    let response = yield call(
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
      getParticipantsMetadata({ participantEKIDs, participantsESID })
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
 * StudiesActions.getNotificationsEntity()
 *
 */

function* getNotificationsEntityWorker(action :SequenceAction) :Saga<WorkerResponse> {
  let workerResponse = {};
  try {
    yield put(getNotificationsEntity.request(action.id));

    const entitySetId = yield select(selectESIDByCollection(NOTIFICATION, AppModules.CHRONICLE_CORE));

    const response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId }));
    if (response.error) throw response.error;

    const entityKeyId = getEntityKeyId(response.data);
    workerResponse = { data: entityKeyId };

    yield put(getNotificationsEntity.success(action.id, { entityKeyId }));
  }
  catch (error) {
    workerResponse = { error };
    yield put(getNotificationsEntity.failure(action.id));
  }
  finally {
    yield put(getNotificationsEntity.finally(action.id));
  }

  return workerResponse;
}

function* associateExistingStudyWithNotifications(partOfAssociationVal, studyEntityKeyId) :Generator<*, *, *> {
  const workerResponse = {};
  try {
    const entitySetIds = yield select(getSelectedOrgEntitySetIds());
    const propertyTypeIds = yield select(selectPropertyTypeIds());
    const selectedOrgId :UUID = yield select((state) => state.getIn(['app', SELECTED_ORG_ID]));
    const selectedOrg = yield select((state) => state.getIn(['app', ORGS, selectedOrgId]));

    const studyEntitySetId = yield select(selectESIDByCollection(STUDIES, AppModules.CHRONICLE_CORE));
    const partOfEntitySetId = yield select(selectESIDByCollection(PART_OF, AppModules.CHRONICLE_CORE));
    const notificationsESID = yield select(selectESIDByCollection(NOTIFICATION, AppModules.CHRONICLE_CORE));

    const IdFQNPropertyTypeId = yield select(selectPropertyTypeId(ID_FQN));

    // get notification entity if it exists
    const notificationsRes = yield call(getNotificationsEntityWorker, getNotificationsEntity());
    if (notificationsRes.error) throw notificationsRes.error;

    const notificationsEKID = notificationsRes.data;

    // case 1: notifications entity DNE: create entity and associate with study
    if (!notificationsEKID) {
      const formData = {
        [getPageSectionKey(1, 1)]: {
          [getEntityAddressKey(0, NOTIFICATION, DESCRIPTION_FQN)]:
        `Notification entity for org: {title: ${selectedOrg.get('title')}, id: ${selectedOrg.get('id')}}`
        }
      };

      const associations = [
        [PART_OF, 0, NOTIFICATION, studyEntityKeyId, STUDIES, {
          [ID_FQN.toString()]: [partOfAssociationVal],
        }]
      ];

      const associationEntityData = processAssociationEntityData(
        fromJS(associations),
        entitySetIds,
        propertyTypeIds
      );

      const entityData = processEntityData(
        formData,
        entitySetIds,
        propertyTypeIds
      );

      const response = yield call(submitDataGraphWorker, submitDataGraph({ associationEntityData, entityData }));
      if (response.error) throw response.error;
      workerResponse.data = {
        partOfEntityKeyId: getIn(response.data, ['entitySetIds', partOfEntitySetId, 0]),
        notificationsEKID: getIn(response.data, ['entityKeyIds', notificationsESID, 0])
      };
    }
    // case 2: notifications entity already exists. Simply associate study with notification
    else {
      const associations = {
        [partOfEntitySetId]: [{
          data: {
            [IdFQNPropertyTypeId]: [partOfAssociationVal]
          },
          dst: {
            entitySetId: studyEntitySetId,
            entityKeyId: studyEntityKeyId
          },
          src: {
            entitySetId: notificationsESID,
            entityKeyId: notificationsEKID
          }
        }]
      };
      const response = yield call(createAssociationsWorker, createAssociations(associations));
      if (response.error) throw response.error;

      workerResponse.data = {
        partOfEntityKeyId: getIn(response.data, [partOfEntitySetId, 0]),
        notificationsEKID
      };
    }
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
      (state) => state.getIn([STUDIES_REDUX_CONSTANTS.STUDIES, PART_OF_ASSOCIATION_EKID_MAP, studyId])
    );
    let notificationsEKID = yield select((state) => state.getIn([STUDIES_REDUX_CONSTANTS.STUDIES, NOTIFICATIONS_EKID]));

    const entitySetIds = yield select(getSelectedOrgEntitySetIds());
    const propertyTypeIds = yield select(selectPropertyTypeIds());

    // STEP 1: create notifications -> partof -> study association if it doesnt exist
    const notificationsEnabled = getIn(formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, STUDIES, NOTIFICATION_ENABLED)]);

    const partOfAssociationVal = notificationsEnabled ? studyId : null;

    if (!partOfEntityKeyId) {
      const response = yield call(associateExistingStudyWithNotifications, partOfAssociationVal, studyEntityKeyId);
      if (response.error) throw response.error;
      partOfEntityKeyId = response.data.partOfEntityKeyId;
      notificationsEKID = response.data.notificationsEKID;
    }
    else {
      formData = setIn(formData,
        [getPageSectionKey(1, 1), getEntityAddressKey(
          partOfEntityKeyId, PART_OF, ID_FQN
        )], partOfAssociationVal);
    }

    // remove notification_enabled property since it is not a part of chronicle_studies entity set
    formData = removeIn(formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, STUDIES, NOTIFICATION_ENABLED)]);

    initialFormData = removeIn(initialFormData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, STUDIES, NOTIFICATION_ENABLED)]);

    // Step 2: update study details
    const entityIndexToIdMap :Map = Map()
      .setIn([STUDIES, 0], studyEntityKeyId)
      .setIn([PART_OF, 0], partOfEntityKeyId);

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

    const entitySetId :UUID = entitySetIds.get(STUDIES);
    const studyEntityData = getIn(entityData, [entitySetId, 0]);

    // update notifications : set entity set ids, and association key id

    yield put(updateStudy.success(action.id, {
      notificationsEKID,
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
 * StudiesActions.addStudyParticipant()
 *
 */

function* addStudyParticipantWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(addStudyParticipant.request(action.id));

    const { value } = action;
    const { studyId, studyEntityKeyId } = value;
    let { formData } = value;

    const propertyTypeIds = yield select(selectPropertyTypeIds());
    const entitySetIds = yield select(getSelectedOrgEntitySetIds());

    const dateEnrolled = new Date().toISOString();
    const associations = [
      [PARTICIPATED_IN, 0, PARTICIPANTS, studyEntityKeyId, STUDIES, {
        [STATUS.toString()]: [ENROLLED],
        [DATE_ENROLLED.toString()]: [dateEnrolled]
      }]
    ];
    let entityData = processEntityData(formData, entitySetIds, propertyTypeIds);
    const associationEntityData = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);

    const response = yield call(submitDataGraphWorker, submitDataGraph({ entityData, associationEntityData }));
    if (response.error) throw response.error;

    // get entity key ids from submitted data graph
    const participatedInEKID = getIn(
      response.data,
      ['entitySetIds', entitySetIds.get(PARTICIPATED_IN), 0]
    );
    const participantEntityKeyId = getIn(
      response.data,
      ['entityKeyIds', entitySetIds.get(PARTICIPANTS), 0]
    );

    // reconstruct created entity
    formData = setIn(
      formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, PARTICIPANTS, OPENLATTICE_ID_FQN)],
      participantEntityKeyId
    );
    entityData = processEntityData(formData, entitySetIds, propertyTypeIds.map((id, fqn) => fqn));

    let participantEntityData = fromJS(getIn(entityData, [entitySetIds.get(PARTICIPANTS), 0]));
    participantEntityData = participantEntityData
      .set(STATUS, [ENROLLED])
      .set(EVENT_COUNT, ['---'])
      .set(PARTICIPATED_IN_EKID, [participatedInEKID])
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

    const notificationsESID = yield select(selectESIDByCollection(NOTIFICATION, AppModules.CHRONICLE_CORE));
    const partOfEntitySetId = yield select(selectESIDByCollection(PART_OF, AppModules.CHRONICLE_CORE));

    const searchFilter = {
      destinationEntitySetIds: [studiesEntitySetId],
      edgeEntitySetIds: [partOfEntitySetId],
      entityKeyIds: studyEntityKeyIds.toArray(),
      sourceEntitySetIds: [notificationsESID]
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

    const studiesEntitySetId = yield select(selectESIDByCollection(STUDIES, AppModules.CHRONICLE_CORE));

    let response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: studiesEntitySetId }));
    if (response.error) {
      throw response.error;
    }

    let studies = fromJS(response.data).filter((study) => study.getIn([STUDY_ID, 0]));

    // get notification status for studies
    if (!studies.isEmpty()) {
      response = yield call(getStudyNotificationStatusWorker, getStudyNotificationStatus({
        studiesEntitySetId,
        studies
      }));
      if (response.error) throw response.error;

      // get studies that have time use diary
      const studyEntityKeyIds = studies.map(getEntityKeyId);
      response = yield call(getTimeUseDiaryStudiesWorker, getTimeUseDiaryStudies(studyEntityKeyIds.toJS()));
      if (response.error) {
        throw response.error;
      }
    }

    studies = studies
      .toMap()
      .mapKeys((index :number, study :Map) => study.getIn([STUDY_ID, 0]));

    yield put(getStudies.success(action.id, studies));
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

    const propertyTypeIds = yield select(selectPropertyTypeIds());
    const entitySetIds = yield select(getSelectedOrgEntitySetIds());

    const notificationsEnabled = getIn(formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, STUDIES, NOTIFICATION_ENABLED)]);

    // remove notification_enabled property since it's not part of study entity
    formData = removeIn(
      formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, STUDIES, NOTIFICATION_ENABLED)]
    );

    const associations = [];

    const associationEntityData = processAssociationEntityData(
      associations,
      entitySetIds,
      propertyTypeIds
    );

    const entityData = processEntityData(
      formData,
      entitySetIds,
      propertyTypeIds
    );

    const response = yield call(submitDataGraphWorker, submitDataGraph({ associationEntityData, entityData }));
    if (response.error) throw response.error;

    const studyEntitySetId :UUID = entitySetIds.get(STUDIES);
    const studyEntityKeyId :UUID = getIn(response.data, ['entityKeyIds', studyEntitySetId, 0]);

    // associate study with notifications
    const studyId = getIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, STUDIES, STUDY_ID)]);
    const partOfAssociationVal = notificationsEnabled ? studyId : null;

    const notificationWorkerRes = yield call(
      associateExistingStudyWithNotifications,
      partOfAssociationVal,
      studyEntityKeyId
    );
    if (notificationWorkerRes.error) throw notificationWorkerRes.error;

    const { partOfEntityKeyId, notificationsEKID } = notificationWorkerRes.data;

    // reconstruct the created study
    const studyEntity = constructEntityFromFormData(entitySetIds, propertyTypeIds, formData, studyEntityKeyId);

    yield put(createStudy.success(action.id, {
      notificationsEKID,
      notificationsEnabled,
      partOfEntityKeyId,
      studyEntity,
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

export {
  addStudyParticipantWatcher,
  addStudyParticipantWorker,
  changeEnrollmentStatusWatcher,
  createStudyWatcher,
  deleteStudyParticipantWatcher,
  getParticipantsMetadataWorker,
  getStudiesWatcher,
  getStudiesWorker,
  getStudyParticipantsWatcher,
  updateStudyWatcher,
  updateStudyWorker,
  getNotificationsEntityWorker
};
