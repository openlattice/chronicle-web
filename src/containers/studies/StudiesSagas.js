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
import { Constants, EntityDataModelApi } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  DataApiActions,
  DataApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas
} from 'lattice-sagas';
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
import { ENTITY_SET_NAMES, PARTICIPANTS_PREFIX } from '../../core/edm/constants/EntitySetNames';
import { ENTITY_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { submitDataGraph } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker } from '../../core/sagas/data/DataSagas';

const { getEntityTypeId } = EntityDataModelApi;
const { createEntitySets } = EntitySetsApiActions;
const { createEntitySetsWorker } = EntitySetsApiSagas;
const { getPageSectionKey, getEntityAddressKey } = DataProcessingUtils;
const { getEntityDataWorker, getEntitySetDataWorker } = DataApiSagas;
const { getEntityData, getEntitySetData } = DataApiActions;

const { OPENLATTICE_ID_FQN } = Constants;
const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const { STUDY_ID, STUDY_NAME, STUDY_EMAIL } = PROPERTY_TYPE_FQNS;
const { PERSON } = ENTITY_TYPE_FQNS;

const LOG = new Logger('StudiesSagas');

function* addStudyParticipantWorker(action :SequenceAction) :Generator<*, *, *> {
  const { value, id } = action;
  try {
    yield put(addStudyParticipant.request(id));

    const response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;

    yield put(addStudyParticipant.success(id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(addStudyParticipant.failure(id, error));
  }
  finally {
    yield put(addStudyParticipant.finally(id));
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

function* createParticipantEntitySet(formData) :Generator<*, *, *> {
  const workerResponse = {};
  try {
    const studyName = getIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_NAME)]);
    const studyId = getIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID)]);
    const email = getIn(formData, [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_EMAIL)]);

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
    }
  }
  catch (error) {
    workerResponse.error = error;
  }
  return workerResponse;
}

function* createStudyWorker(action :SequenceAction) :Generator<*, *, *> {
  const { id, value } = action;
  const { newFormData } = value;
  let response = {};

  response = yield call(createParticipantEntitySet, newFormData);
  // do not create a new study if createParticipantEntitySet fails
  if (response.error) throw response.error;
  try {
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
    yield put(createStudy.failure(id, error));
  }
  finally {
    yield put(createStudy.finally(id));
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
