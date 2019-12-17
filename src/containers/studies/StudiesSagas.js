/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import { Constants } from 'lattice';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_STUDIES,
  getStudies,
} from './StudiesActions';

import Logger from '../../utils/Logger';
import { ENTITY_SET_NAMES } from '../../core/edm/constants/EntitySetNames';

const {
  getEntitySetDataWorker,
} = DataApiSagas;
const {
  getEntitySetData,
} = DataApiActions;

const LOG = new Logger('StudiesSagas');
const { OPENLATTICE_ID_FQN } = Constants;
const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;

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

    const studies = {};
    response.data.forEach((study) => {
      studies[study[OPENLATTICE_ID_FQN]] = study;
    });
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

export {
  getStudiesWatcher,
  getStudiesWorker,
};
