/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { EntitySetsApi } from 'lattice';
import {
  EntityDataModelApiActions,
  EntityDataModelApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';
import Logger from '../../utils/Logger';
import { isDefined } from '../../utils/LangUtils';
import {
  GET_ALL_ENTITY_SET_IDS,
  GET_EDM_TYPES,
  getAllEntitySetIds,
  getEntityDataModelTypes,
} from './EDMActions';

import { ENTITY_SET_NAMES_LIST } from './constants/EntitySetNames';

const LOG = new Logger('EDMSagas');
const { getEntitySetIds } = EntitySetsApi;

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
  try {
    yield put(getAllEntitySetIds.request(action.id));
    const response = yield call(getEntitySetIds, ENTITY_SET_NAMES_LIST);
    if (response) {
      yield put(getAllEntitySetIds.success(action.id, response));
    }
    else {
      yield put(getAllEntitySetIds.failure(action.id));
    }
  }
  catch (error) {
    yield put(getAllEntitySetIds.failure(action.id, error));
  }
  finally {
    yield put(getAllEntitySetIds.finally(action.id));
  }

}

function* getAllEntitySetIdsWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_ALL_ENTITY_SET_IDS, getAllEntitySetIdsWorker);
}


export {
  getEntityDataModelTypesWatcher,
  getEntityDataModelTypesWorker,
  getAllEntitySetIdsWorker,
  getAllEntitySetIdsWatcher
};
