/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import { getIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  DataApiActions,
  DataApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas
} from 'lattice-sagas';
import { EntityDataModelApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  CREATE_STUDY,
  GET_STUDY_DETAILS,
  createParticipantEntitySet,
  createStudy,
  getStudyDetails
} from './StudyActions';

import Logger from '../../utils/Logger';
import { ENTITY_SET_NAMES, PARTICIPANTS_PREFIX } from '../../core/edm/constants/EntitySetNames';
import { ENTITY_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { submitDataGraph } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker } from '../../core/sagas/data/DataSagas';

const {
  getPageSectionKey,
  getEntityAddressKey
} = DataProcessingUtils;

const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const { STUDY_ID, STUDY_NAME, STUDY_EMAIL } = PROPERTY_TYPE_FQNS;
const { PERSON } = ENTITY_TYPE_FQNS;

const { getEntityTypeId } = EntityDataModelApi;
const { getEntityData } = DataApiActions;
const { getEntityDataWorker } = DataApiSagas;
const { createEntitySets } = EntitySetsApiActions;
const { createEntitySetsWorker } = EntitySetsApiSagas;

const LOG = new Logger('StudySagas');

function* createParticipantEntitySetWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse = {};

  const { value } = action;
  const studyName = getIn(value, [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_NAME)]);
  const studyId = getIn(value, [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID)]);
  const email = getIn(value, [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_EMAIL)]);

  try {
    yield put(createParticipantEntitySet.request(action.id));

    const entityTypeId = yield call(getEntityTypeId, PERSON);
    const entitySet = {
      entityTypeId,
      name: `${PARTICIPANTS_PREFIX}${studyId}`,
      title: `${studyName} Participants`,
      description: `Participants of study with name ${studyName} and id ${studyId}`,
      external: false,
      contacts: [email]
    };

    // the only property type is PERSON_ID
    const response = yield call(createEntitySetsWorker, createEntitySets([entitySet]));
    if (response.error) {
      workerResponse.error = response.error;
      yield put(createParticipantEntitySet.failure(action.id, response.error));
    }
    const entitySetIdMap = response.data;
    const entitySetId = entitySetIdMap[entitySet.name];
    yield put(createParticipantEntitySet.success(action.id, { studyId, entitySetId }));

  }
  catch (error) {
    workerResponse.error = error;
  }
  return workerResponse;
}


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
function* createStudyWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  const { newFormData } = value;
  let response = {};

  response = yield call(createParticipantEntitySetWorker, createParticipantEntitySet(newFormData));
  // do not create a new study if createParticipantEntitySet fails
  if (response.error) throw response.error;
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

function* getStudyDetailsWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_STUDY_DETAILS, getStudyDetailsWorker);
}

export {
  createStudyWatcher,
  getStudyDetailsWatcher,
  getStudyDetailsWorker,
};
