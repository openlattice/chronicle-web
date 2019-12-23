/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Models } from 'lattice';
import { DataApiActions, DataApiSagas } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import { SUBMIT_DATA_GRAPH, submitDataGraph } from './DataActions';

import Logger from '../../../utils/Logger';

const LOG = new Logger('DataSagas');

const { DataGraphBuilder } = Models;
const { createEntityAndAssociationData } = DataApiActions;
const { createEntityAndAssociationDataWorker } = DataApiSagas;

/*
 *
 * DataActions.submitDataGraph()
 *
 */

function* submitDataGraphWorker(action :SequenceAction) :Generator<*, *, *> {

  const workerResponse :Object = {};
  const { value } = action;

  try {
    yield put(submitDataGraph.request(action.id, value));

    const dataGraph = (new DataGraphBuilder())
      .setAssociations(value.associationEntityData)
      .setEntities(value.entityData)
      .build();

    const response = yield call(createEntityAndAssociationDataWorker, createEntityAndAssociationData(dataGraph));
    if (response.error) throw response.error;
    workerResponse.data = response.data;

    yield put(submitDataGraph.success(action.id, response.data));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    yield put(submitDataGraph.failure(action.id, error));
  }
  finally {
    yield put(submitDataGraph.finally(action.id));
  }

  return workerResponse;
}

function* submitDataGraphWatcher() :Generator<*, *, *> {

  yield takeEvery(SUBMIT_DATA_GRAPH, submitDataGraphWorker);
}

export {
  submitDataGraphWatcher,
  submitDataGraphWorker,
};
