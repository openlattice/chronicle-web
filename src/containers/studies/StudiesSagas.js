/*
 * @flow
 */
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_STUDIES,
  getStudies,
} from './StudiesActions';

import Logger from '../../utils/Logger';
import { ENTITY_SET_NAMES } from '../../core/edm/constants/EntitySetNames';

const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const { getEntitySetDataWorker } = DataApiSagas;
const { getEntitySetData } = DataApiActions;
const LOG = new Logger('StudiesSagas');

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
    // console.log(response.data);
    // const studies :List<Map<*, *>> = response.data.map((study) => {
    //   const map :Map = Map().withMutations((item) => {
    //     Object.keys(study).map((key) => item.set(key, study[key][0]));
    //   })
    //   // Object.keys(studies).map((key) => map.set(key, study[key][0]));
    //   return map;
    // });
    // const studies = response.data.map((item) => Object.keys(item).map())

    console.log(response.data);
    yield put(getStudies.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
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
