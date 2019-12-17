/*
 * @flow
 */

import {
  call,
  put,
  takeEvery
} from '@redux-saga/core/effects';
import { getIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  EntitySetsApiActions,
  EntitySetsApiSagas
} from 'lattice-sagas';
import { EntityDataModelApi } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  ADD_PARTICIPANT,
  CREATE_STUDY,
  addStudyParticipant,
  createParticipantEntitySet,
  createStudy,
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

function* addStudyParticipantWorker(action :SequenceAction) :Generator<*, *, *> {
  const { value, id } = action;
  try {
    yield put(addStudyParticipant.request(id));

    const response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;

    yield put(addStudyParticipant.success(id, response.data));
  }
  catch (error) {
    LOG.error('caught exception in addStudyParticipant()', error);
    yield put(addStudyParticipant.failure(id, error));
  }
  finally {
    yield put(addStudyParticipant.finally(id));
  }
}

function* addStudyParticipantWatcher() :Generator<*, *, *> {
  yield takeEvery(ADD_PARTICIPANT, addStudyParticipantWorker);
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


export {
  addStudyParticipantWatcher,
  createStudyWatcher,
};
