/*
 * @flow
 */

import uuid from 'uuid/v4';
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  fromJS,
  getIn,
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
  SearchApiSagas
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
  getParticipantsEnrollmentStatus,
  getStudies,
  getStudyParticipants,
  updateStudy
} from './StudiesActions';

import EnrollmentStatuses from '../../utils/constants/EnrollmentStatus';
import Logger from '../../utils/Logger';
import { selectEntityTypeId } from '../../core/edm/EDMUtils';
import { ASSOCIATION_ENTITY_SET_NAMES, ENTITY_SET_NAMES } from '../../core/edm/constants/EntitySetNames';
import { ENTITY_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { submitDataGraph, submitPartialReplace } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker, submitPartialReplaceWorker } from '../../core/sagas/data/DataSagas';
import { PARTICIPANTS_PREFIX } from '../../utils/constants/GlobalConstants';

const {
  deleteEntityDataWorker,
  getEntitySetDataWorker,
  updateEntityDataWorker
} = DataApiSagas;
const {
  deleteEntityData,
  getEntitySetData,
  updateEntityData
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
const { DeleteTypes, UpdateTypes } = Types;

const { OPENLATTICE_ID_FQN } = Constants;

const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const { PARTICIPATED_IN } = ASSOCIATION_ENTITY_SET_NAMES;
const {
  STATUS,
  STUDY_EMAIL,
  STUDY_ID,
  STUDY_NAME,
} = PROPERTY_TYPE_FQNS;
const { PERSON } = ENTITY_TYPE_FQNS;
const { ENROLLED, NOT_ENROLLED } = EnrollmentStatuses;

const LOG = new Logger('StudiesSagas');

/*
 *
 * StudiesActions.changeEnrollmentStatus()
 *
 */

function* changeEnrollmentWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(changeEnrollmentStatus.request(action.id));

    const { value } = action;
    const {
      enrollmentStatus,
      participantEntityKeyId,
      studyId,
    } = value;

    const participantsEntityName = `${PARTICIPANTS_PREFIX}${studyId}`;
    const participantsEntitySetId = yield select(
      (state) => state.getIn(['studies', 'participantEntitySetIds', participantsEntityName])
    );
    const associationEntityKeyId = yield select(
      (state) => state.getIn(['studies', 'associationKeyIds', participantsEntitySetId, participantEntityKeyId])
    );
    const statusPropertyTypeId = yield select((state) => state.getIn(['edm', 'propertyTypeIds', STATUS]));
    const participatedInEntitySetId = yield select((state) => state.getIn(['edm', 'entitySetIds', PARTICIPATED_IN]));
    const newEnrollmentStatus = enrollmentStatus === ENROLLED ? NOT_ENROLLED : ENROLLED;

    const response = yield call(updateEntityDataWorker, updateEntityData({
      entities: {
        [associationEntityKeyId]: {
          [statusPropertyTypeId]: [newEnrollmentStatus]
        }
      },
      entitySetId: participatedInEntitySetId,
      updateType: UpdateTypes.PartialReplace
    }));

    if (response.error) throw response.error;

    yield put(changeEnrollmentStatus.success(action.id, {
      newEnrollmentStatus,
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

function* changeEnrollmentWatcher() :Generator<*, *, *> {
  yield takeEvery(CHANGE_ENROLLMENT_STATUS, changeEnrollmentWorker);
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

    const participantsEntityName = `${PARTICIPANTS_PREFIX}${studyId}`;
    const participantsEntitySetId = yield select(
      (state) => state.getIn(['studies', 'participantEntitySetIds', participantsEntityName])
    );

    const response = yield call(
      deleteEntityDataWorker,
      deleteEntityData({
        entitySetId: participantsEntitySetId,
        entityKeyIds: [participantEntityKeyId],
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
    const { participants, participantsEntitySetId } = value;

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
        .map((associations :List) => associations.first().getIn(['associationDetails', STATUS, 0]));
      workerResponse.data = enrollmentStatus;

      // mapping from participantEntityKeyId -> association EKID
      const associationKeyIds :Map = fromJS(response.data)
        .map((associations :List) => associations.first().getIn(['associationDetails', OPENLATTICE_ID_FQN, 0]));

      yield put(getParticipantsEnrollmentStatus.success(action.id, { associationKeyIds, participantsEntitySetId }));
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
  try {
    yield put(getStudyParticipants.request(action.id));

    const studyId = action.value;

    // only fetch if data is not found in redux store.
    let participants = yield select((state) => state.getIn(['studies', 'participants', studyId]));
    if (participants) {
      yield put(getStudyParticipants.success(action.id));
    }
    else {
      const participantsEntitySetName = `${PARTICIPANTS_PREFIX}${studyId}`;
      let response = {};

      response = yield call(getEntitySetIdWorker, getEntitySetId(participantsEntitySetName));
      if (response.error) throw response.error;
      const participantsEntitySetId = response.data;

      response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId: participantsEntitySetId }));
      if (response.error) throw response.error;

      participants = fromJS(response.data)
        .toMap()
        .mapKeys((index, participant) => participant.getIn([OPENLATTICE_ID_FQN, 0]));

      // get enrollment status
      response = yield call(
        getParticipantsEnrollmentStatusWorker,
        getParticipantsEnrollmentStatus({ participants, participantsEntitySetId })
      );
      if (response.error) throw response.error;
      const enrollmentStatus :Map = response.data;

      // update participant with enrollment status
      participants = participants.map((participant, id) => participant
        .set(STATUS, [enrollmentStatus.get(id)])
        .set('id', [id])); // required by LUK table
      yield put(getStudyParticipants.success(action.id, {
        participants,
        participantsEntitySetId,
        participantsEntitySetName,
        studyId,
      }));
    }
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getStudyParticipants.failure(action.id));
  }
  finally {
    yield put(getStudyParticipants.finally(action.id));
  }
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
      .setName(`${PARTICIPANTS_PREFIX}${studyId}`)
      .setTitle(`${studyName} Participants`)
      .build();

    const response = yield call(createEntitySetsWorker, createEntitySets([entitySet]));
    if (response.error) throw response.error;

    const responseObj = {
      entitySetName: entitySet.name,
      entitySetId: response.data[entitySet.name]
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

    const entitySetName = `${PARTICIPANTS_PREFIX}${studyId}`;
    const participantsEntitySetId = participantEntitySetIds.get(entitySetName);

    const associations = [
      [PARTICIPATED_IN, 0, entitySetName, studyEntityKeyId, CHRONICLE_STUDIES, {
        [STATUS.toString()]: [ENROLLED]
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
      [getPageSectionKey(1, 1), getEntityAddressKey(0, entitySetName, OPENLATTICE_ID_FQN)], participantEntityKeyId
    );
    entityData = processEntityData(formData, entitySetIds, propertyTypeIds.map((id, fqn) => fqn));

    let participantEntityData = fromJS(getIn(entityData, [participantsEntitySetId, 0]));
    participantEntityData = participantEntityData
      .set(STATUS, [ENROLLED])
      .set('id', [participantEntityKeyId]); // required by LUK table

    yield put(addStudyParticipant.success(action.id, {
      participantEntityData,
      participantEntityKeyId,
      participantsEntitySetId,
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

    const response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId }));
    if (response.error) {
      throw response.error;
    }

    const studies :Map<UUID, Map> = fromJS(response.data)
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

    let entityData = processEntityData(formData, entitySetIds, propertyTypeIds);
    response = yield call(submitDataGraphWorker, submitDataGraph({ associationEntityData: {}, entityData }));
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
  changeEnrollmentWatcher,
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
  updateStudyWorker
};
