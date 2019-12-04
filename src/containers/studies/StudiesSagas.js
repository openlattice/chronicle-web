import {
  all,
  call,
  put,
  takeEvery
} from '@redux-saga/core/effects';
import {
  SearchApiActions,
  SearchApiSagas
} from 'lattice-sagas';
import {
  EntityDataModelApi,
  EntitySetsApi,
  DataApi,
  AuthorizationApi
} from 'lattice';
import type { SequenceAction } from 'redux-reqseq';
import {
  GET_STUDIES,
  GET_STUDIES_PERMISSIONS,
  getStudies,
  getStudiesPermissions
} from './StudiesActions';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';

const { searchEntitySetData } = SearchApiActions;
const { searchEntitySetDataWorker } = SearchApiSagas;

function* getStudyEntitySetId(studyId): Generator<*, *, *> {
  try {
    const entitySetName = `${ENTITY_SETS.PARTICIPANTS_PREFIX}${studyId}`;
    return yield call(EntitySetsApi.getEntitySetId, entitySetName);
  } catch(error) {
    return null;
  }
}
function* getStudiesPermissionsWorker(action: SequenceAction) : Generator<*, *, *> {
  const response = {};
  try {
    yield put(getStudiesPermissions.request(action.id));
    const studyIds = action.value;
    const entitySetIds = yield all(studyIds.map(studyId => call(getStudyEntitySetId, studyId)));
    const studyIdsByEntitySetIds = {};
    entitySetIds.forEach((id, index) => {
      if (id) {
        studyIdsByEntitySetIds[id] = studyIds[index];
      }
    });

    const accessChecks = Object.keys(studyIdsByEntitySetIds).map(entitySetId => ({
      aclKey: [entitySetId],
      permissions: ['WRITE']
    }));

    const permissions = yield call(AuthorizationApi.checkAuthorizations, accessChecks);
    const writableStudyIds = permissions.filter(item => item.permissions.WRITE)
      .map(item => studyIdsByEntitySetIds[item.aclKey[0]]);
    response.data = writableStudyIds;
    yield put (getStudiesPermissions.success(action.id));
  } catch(error) {
    response.error = error;
    yield put(getStudiesPermissions.failure(action.id, error));
  } finally {
    yield put(getStudiesPermissions.finally(action.id));
  }

  return response;
}

function* getStudiesPermissionsWatcher(action: SequenceAction) : Generator<*, *, *> {
  yield takeEvery(GET_STUDIES_PERMISSIONS, getStudiesPermissionsWorker);
}

function* getStudiesWatcher(action) : Generator<*, *, *> {
  yield takeEvery(GET_STUDIES, getStudiesWorker);
}

function* getStudiesWorker(action :SequenceAction) : Generator<*, *, *> {
  try {
    yield put(getStudies.request(action.id));
    // console.log(EntitySetsApi);
    const entitySetId = yield call(EntitySetsApi.getEntitySetId, ENTITY_SETS.CHRONICLE_STUDIES);
    // console.log(sagas);
    let response = yield call(
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

    const results = response.data.hits;
    const studyIds = results.map(study => study[PROPERTY_TYPES.STUDY_ID][0]);
    response = yield call (getStudiesPermissionsWorker, getStudiesPermissions(studyIds));

    if (response.error) {
      throw response.error;
    }

    const writableStudyIds = response.data;
    const writableStudies = results.filter(
      study => writableStudyIds.includes(study[PROPERTY_TYPES.STUDY_ID][0])
    );
    yield put(getStudies.success(action.id, writableStudies));
  } catch (error) {
    yield put(getStudies.failure(action.id, error));
  } finally {
    yield put(getStudies.finally(action.id));
  }
}

export {
  getStudiesWorker,
  getStudiesPermissionsWatcher,
  getStudiesWatcher
}
