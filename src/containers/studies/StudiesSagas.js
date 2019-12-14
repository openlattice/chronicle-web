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
  CREATE_STUDY,
  GET_STUDIES,
  GET_STUDY_DETAILS,
  createStudy,
  getStudies,
  getStudyDetails
} from './StudiesActions';

import Logger from '../../utils/Logger';
import { ENTITY_SET_NAMES } from '../../core/edm/constants/EntitySetNames';
import { submitDataGraph } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker } from '../../core/sagas/data/DataSagas';

const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const {
  getEntityDataWorker,
  getEntitySetDataWorker,
} = DataApiSagas;

const {
  getEntityData,
  getEntitySetData,
} = DataApiActions;
const LOG = new Logger('StudiesSagas');

function* getStudyDetailsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(getStudyDetails.request(action.id));

    const entitySetId = yield select(
      (state) => state.getIn(['edm', 'entitySetIds', CHRONICLE_STUDIES])
    );
    const entityKeyId = action.value;

    const response = yield call(getEntityDataWorker, getEntityData({ entitySetId, entityKeyId }));
    if (response.error) throw response.error;

    yield put(getStudyDetails.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getStudyDetails.failure(action.id, error));
  }
  finally {
    yield put(getStudyDetails.finally(action.id));
  }
}

function* getStudyDetailsWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_STUDY_DETAILS, getStudyDetailsWorker);
}

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

function* createStudyWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  let response = {};
  try {
    yield put(createStudy.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }

    yield put(createStudy.success(id));
  }
  catch (error) {
    LOG.error('caught exception in createStudy()', error);
    yield put(createStudy.failure(id, error));
  }
  finally {
    yield put(createStudy.finally(id));
  }
}

function* createStudyWatcher() :Generator<*, *, *> {
  yield takeEvery(CREATE_STUDY, createStudyWorker);
}

export {
  createStudyWatcher,
  createStudyWorker,
  getStudiesWatcher,
  getStudiesWorker,
  getStudyDetailsWatcher,
  getStudyDetailsWorker,
};
