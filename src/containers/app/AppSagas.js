/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import type { SequenceAction } from 'redux-reqseq';

import { INITIALIZE_APPLICATION, initializeApplication } from './AppActions';

import Logger from '../../utils/Logger';
import {
  getAllEntitySetIds,
  getEntityDataModelTypes,
} from '../../core/edm/EDMActions';
import {
  getAllEntitySetIdsWorker,
  getEntityDataModelTypesWorker,
} from '../../core/edm/EDMSagas';
import { getGlobalNotificationsEKID, getStudies } from '../studies/StudiesActions';
import { getGlobalNotificationsEKIDWorker, getStudiesWorker } from '../studies/StudiesSagas';

const LOG = new Logger('AppSagas');

/*
 *
 * AppActions.initializeApplication()
 *
 */

function* initializeApplicationWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(initializeApplication.request(action.id));
    const responses :Object[] = yield all([
      call(getEntityDataModelTypesWorker, getEntityDataModelTypes()),
      call(getAllEntitySetIdsWorker, getAllEntitySetIds()),
      // ...any other required requests
    ]);
    responses.forEach((res) => {
      if (res.error) throw res.error;
    });
    // get all studies only after getting entitySetIds
    let response = yield call(getStudiesWorker, getStudies());
    if (response.error) throw response.error;

    // get entity key id of entity in global notifications entity set
    response = yield call(getGlobalNotificationsEKIDWorker, getGlobalNotificationsEKID());
    if (response.error) throw response.error;

    yield put(initializeApplication.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(initializeApplication.failure(action.id, error));
  }
  finally {
    yield put(initializeApplication.finally(action.id));
  }
}

function* initializeApplicationWatcher() :Generator<*, *, *> {

  yield takeEvery(INITIALIZE_APPLICATION, initializeApplicationWorker);
}

export {
  initializeApplicationWatcher,
  initializeApplicationWorker,
};
