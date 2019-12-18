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
  ADD_PARTICIPANT,
  CREATE_STUDY,
  GET_STUDIES,
  addStudyParticipant,
  createStudy,
  getStudies,
} from './StudiesActions';

import Logger from '../../utils/Logger';
import { createParticipantsEntitySet } from '../../core/edm/EDMActions';
import { createParticipantsEntitySetWorker } from '../../core/edm/EDMSagas';
import { ENTITY_SET_NAMES } from '../../core/edm/constants/EntitySetNames';
import { submitDataGraph } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker } from '../../core/sagas/data/DataSagas';

const { getEntityDataWorker, getEntitySetDataWorker } = DataApiSagas;
const { getEntityData, getEntitySetData } = DataApiActions;

const { OPENLATTICE_ID_FQN } = Constants;
const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;

const LOG = new Logger('StudiesSagas');

function* addStudyParticipantWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    const { value, id } = action;

    yield put(addStudyParticipant.request(id));

    const response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;

    yield put(addStudyParticipant.success(id, response.data));
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


function* createStudyWorker(action :SequenceAction) :Generator<*, *, *> {

  // do not create a new study if createParticipantsEntitySet fails
  try {
    const { id, value } = action;
    const { newStudyData } = value;
    let response = {};

    response = yield call(createParticipantsEntitySetWorker, createParticipantsEntitySet(newStudyData));
    if (response.error) throw response.error;

    yield put(createStudy.request(id, value));

    response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) {
      throw response.error;
    }

    // get the created entity
    const { entityKeyIds } = response.data;
    const entitySetId = yield select(
      (state) => state.getIn(['edm', 'entitySetIds', CHRONICLE_STUDIES])
    );
    const entityKeyId = entityKeyIds[entitySetId][0];
    response = yield call(getEntityDataWorker, getEntityData({ entityKeyId, entitySetId }));
    if (response.error) throw response.error;

    const responseObj = {
      studyUUID: entityKeyId,
      study: response.data
    };
    yield put(createStudy.success(id, responseObj));
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
function* getStudiesWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_STUDIES, getStudiesWorker);
}

export {
  addStudyParticipantWatcher,
  createStudyWatcher,
  getStudiesWatcher,
  getStudiesWorker,
};
