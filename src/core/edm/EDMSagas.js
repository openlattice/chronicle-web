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
// import { EntitySetsApi } from 'lattice';
import { Map } from 'immutable';
import {
  EntityDataModelApiActions,
  EntityDataModelApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_ALL_ENTITY_SET_IDS,
  GET_EDM_TYPES,
  getAllEntitySetIds,
  getEntityDataModelTypes,
  getParticipantsEntitySetsIds
} from './EDMActions';
import {
  ENTITY_SET_NAMES_LIST,
  PARTICIPANTS_PREFIX
} from './constants/EntitySetNames';
import {
  PROPERTY_TYPE_FQNS
} from './constants/FullyQualifiedNames';

import Logger from '../../utils/Logger';
import { isDefined } from '../../utils/LangUtils';

const { STUDY_ID } = PROPERTY_TYPE_FQNS;
const LOG = new Logger('EDMSagas');
const { getEntitySetIds } = EntitySetsApiActions;
const { getEntitySetIdsWorker } = EntitySetsApiSagas;
const { getAllEntityTypes, getAllPropertyTypes } = EntityDataModelApiActions;
const { getAllEntityTypesWorker, getAllPropertyTypesWorker } = EntityDataModelApiSagas;

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
      .map((studyId :string) => `${PARTICIPANTS_PREFIX}${studyId}`)
      .toJS();

    let responseData = {};
    if (studyIds.length === 0) {
      const response = yield call(getEntitySetIdsWorker, getEntitySetIds(studyIds));
      if (response.error) throw response.error;
      responseData = response.data;
    }
    yield put(getParticipantsEntitySetsIds.success(action.id, responseData));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.id, error);
  }
  finally {
    yield put(getParticipantsEntitySetsIds.finally(action.id));
  }
  return workerResponse;
}

export {
  getEntityDataModelTypesWatcher,
  getEntityDataModelTypesWorker,
  getAllEntitySetIdsWorker,
  getAllEntitySetIdsWatcher,
  getParticipantsEntitySetsIdsWorker
};
