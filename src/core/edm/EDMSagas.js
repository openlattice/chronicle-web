/*
 * @flow
 */

import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Map, getIn } from 'immutable';
import { EntityDataModelApi } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  EntityDataModelApiActions,
  EntityDataModelApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  CREATE_PARTICIPANTS_ENTITY_SET,
  GET_ALL_ENTITY_SET_IDS,
  GET_EDM_TYPES,
  createParticipantsEntitySet,
  getAllEntitySetIds,
  getEntityDataModelTypes,
  getParticipantsEntitySetsIds
} from './EDMActions';
import { ENTITY_SET_NAMES, ENTITY_SET_NAMES_LIST, PARTICIPANTS_PREFIX } from './constants/EntitySetNames';
import { ENTITY_TYPE_FQNS, PROPERTY_TYPE_FQNS } from './constants/FullyQualifiedNames';

import Logger from '../../utils/Logger';
import { isDefined } from '../../utils/LangUtils';

const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const { STUDY_ID, STUDY_NAME, STUDY_EMAIL } = PROPERTY_TYPE_FQNS;
const { PERSON } = ENTITY_TYPE_FQNS;

const LOG = new Logger('EDMSagas');
const { createEntitySets, getEntitySetIds } = EntitySetsApiActions;
const { createEntitySetsWorker, getEntitySetIdsWorker } = EntitySetsApiSagas;
const { getAllEntityTypes, getAllPropertyTypes } = EntityDataModelApiActions;
const { getAllEntityTypesWorker, getAllPropertyTypesWorker } = EntityDataModelApiSagas;
const { getPageSectionKey, getEntityAddressKey } = DataProcessingUtils;
const { getEntityTypeId } = EntityDataModelApi;
/*
 *
 * EDMActions.getEntityDataModelTypes()
 *
 */

function* getEntityDataModelTypesWorker(action :SequenceAction) :Generator<*, *, *> {

  const workerResponse :Object = {};

  try {
    yield put(getEntityDataModelTypes.request(action.id));

    const responses :Object[] = yield all([
      call(getAllEntityTypesWorker, getAllEntityTypes()),
      call(getAllPropertyTypesWorker, getAllPropertyTypes()),
    ]);

    // all requests must succeed
    const responseError = responses.reduce(
      (error :any, r :Object) => (isDefined(error) ? error : r.error),
      undefined,
    );
    if (responseError) throw responseError;

    yield put(getEntityDataModelTypes.success(action.id, {
      entityTypes: responses[0].data,
      propertyTypes: responses[1].data,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    workerResponse.error = error;
    yield put(getEntityDataModelTypes.failure(action.id, error));
  }
  finally {
    yield put(getEntityDataModelTypes.finally(action.id));
  }

  return workerResponse;
}

function* getEntityDataModelTypesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_EDM_TYPES, getEntityDataModelTypesWorker);
}

function* getAllEntitySetIdsWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse :Object = {};

  try {
    yield put(getAllEntitySetIds.request(action.id));
    const response = yield call(
      getEntitySetIdsWorker, getEntitySetIds(ENTITY_SET_NAMES_LIST)
    );

    if (response.error) {
      throw response.error;
    }

    yield put(getAllEntitySetIds.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    workerResponse.error = error;
    yield put(getAllEntitySetIds.failure(action.id, error));
  }
  finally {
    yield put(getAllEntitySetIds.finally(action.id));
  }

  return workerResponse;
}

function* getAllEntitySetIdsWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_ALL_ENTITY_SET_IDS, getAllEntitySetIdsWorker);
}

function* getParticipantsEntitySetsIdsWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse = {};
  try {
    yield put(getParticipantsEntitySetsIds.request(action.id));
    const studies = yield select((state) => state.getIn(['studies', 'studies'], Map()));
    const studyIds = studies
      .valueSeq()
      .map((entry :Map) => entry.getIn([STUDY_ID, 0]))
      .map((studyId :string) => `${PARTICIPANTS_PREFIX}${studyId}`);

    let responseData = {};

    if (!studyIds.isEmpty()) {
      const response = yield call(getEntitySetIdsWorker, getEntitySetIds(studyIds.toJS()));
      if (response.error) throw response.error;
      responseData = response.data;
    }

    yield put(getParticipantsEntitySetsIds.success(action.id, responseData));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    getParticipantsEntitySetsIds.failure(action.id, error);
  }
  finally {
    yield put(getParticipantsEntitySetsIds.finally(action.id));
  }
  return workerResponse;
}

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

    const entityTypeId = yield call(getEntityTypeId, PERSON);
    const entitySet = {
      entityTypeId,
      name: `${PARTICIPANTS_PREFIX}${studyId}`,
      title: `${studyName} Participants`,
      description: `Participants of study with name ${studyName} and id ${studyId}`,
      external: false,
      contacts: [email]
    };

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

export {
  createParticipantsEntitySetWatcher,
  createParticipantsEntitySetWorker,
  getAllEntitySetIdsWatcher,
  getAllEntitySetIdsWorker,
  getEntityDataModelTypesWatcher,
  getEntityDataModelTypesWorker,
  getParticipantsEntitySetsIdsWorker
};
