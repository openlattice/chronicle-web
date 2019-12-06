/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';


import { DataApiSagas, DataApiActions } from 'lattice-sagas';
import { ENTITY_SET_NAMES } from '../../core/edm/constants/EntitySetNames';
import {
  GET_STUDIES,
  getStudies,
} from './StudiesActions';
import type { SequenceAction } from 'redux-reqseq';


const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const { getEntitySetDataWorker } = DataApiSagas;
const { getEntitySetData } = DataApiActions;

function* getStudiesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(getStudies.request(action.id));
    const entitySetId = yield select(
      (state) => state.getIn(['edm', 'entitySetIds', CHRONICLE_STUDIES])
    );
    const response = yield call(getEntitySetDataWorker, getEntitySetData({ entitySetId }));

    if (response.error) {
      throw response.error;
    }
    yield put(getStudies.success(action.id, response.data));
  }
  catch (error) {
    yield put(getStudies.failure(action.id, error));
  }
  finally {
    yield put(getStudies.finally(action.id));
  }
}

function* getStudiesWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_STUDIES, getStudiesWorker);
}

export {
  getStudiesWatcher,
  getStudiesWorker,
};
