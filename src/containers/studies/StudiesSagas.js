/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import {
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import {
  EntitySetsApi,
} from 'lattice';
import type { SequenceAction } from 'redux-reqseq';
import {
  GET_STUDIES,
  getStudies,
} from './StudiesActions';
import { ENTITY_SET_NAMES } from '../../core/edm/constants/EntitySetNames';


const { searchEntitySetData } = SearchApiActions;
const { searchEntitySetDataWorker } = SearchApiSagas;


function* getStudiesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(getStudies.request(action.id));

    const entitySetId = yield call(EntitySetsApi.getEntitySetId, ENTITY_SET_NAMES.CHRONICLE_STUDIES);

    // const entitySetId = select((state) => state.getIn('edm', 'entitySetIds', ENTITY_SETS.CHRONICLE_STUDIES));
    // use DataApi.getEntitySetData to fetch instead of search yeah?
    const response = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData({
        entitySetId,
        searchOptions: {
          maxHits: 1000,
          searchTerm: '*',
          start: 0,
        },
      })
    );

    if (response.error) {
      throw response.error;
    }
    yield put(getStudies.success(action.id, response.data.hits));
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
