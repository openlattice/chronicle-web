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
  fromJS,
  getIn,
  setIn,
  Map
} from 'immutable';
import { Constants, Models } from 'lattice';
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
  CREATE_PARTICIPANTS_ENTITY_SET,
  CREATE_STUDY,
  GET_STUDIES,
  addStudyParticipant,
  createParticipantsEntitySet,
  createStudy,
  getStudies,
} from './StudiesActions';

import Logger from '../../utils/Logger';
import { ENTITY_SET_NAMES, PARTICIPANTS_PREFIX } from '../../core/edm/constants/EntitySetNames';
import { ENTITY_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { selectEntityTypeId } from '../../core/edm/EDMUtils';
import { submitDataGraph } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker } from '../../core/sagas/data/DataSagas';

const { getEntitySetDataWorker } = DataApiSagas;
const { getEntitySetData } = DataApiActions;
const { getPageSectionKey, getEntityAddressKey } = DataProcessingUtils;
const { createEntitySetsWorker } = EntitySetsApiSagas;
const { createEntitySets } = EntitySetsApiActions;
const { EntitySetBuilder } = Models;

const { OPENLATTICE_ID_FQN } = Constants;

const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const { STUDY_ID, STUDY_NAME, STUDY_EMAIL } = PROPERTY_TYPE_FQNS;
const { PERSON } = ENTITY_TYPE_FQNS;

const LOG = new Logger('StudiesSagas');


function* createParticipantsEntitySetWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse = {};
  try {
    yield put(createParticipantsEntitySet.request(action.id));
    const newStudyData = action.value;
    const studyName = getIn(newStudyData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_NAME)]);
    const studyId = getIn(newStudyData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID)]);
    const email = getIn(newStudyData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_EMAIL)]);

    const entityTypeId :UUID = yield select(selectEntityTypeId(PERSON));

    const entitySet = new EntitySetBuilder()
      .setContacts([email])
      .setDescription(`Participants of study with name ${studyName} and id ${studyId}`)
      .setEntityTypeId(entityTypeId)
      .setName(`${PARTICIPANTS_PREFIX}${studyId}`)
      .setTitle(`${studyName} Participants`)
      .build();

    const response = yield call(createEntitySetsWorker, createEntitySets([entitySet]));
    if (response.error) throw response.error;

    const responseObj = {
      entitySetName: entitySet.name,
      entitySetId: response.data[entitySet.name]
    };
    yield put(createParticipantsEntitySet.success(action.id, responseObj));

  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(error.type, error);
    yield put(createParticipantsEntitySet.failure(action.id, error));
  }
  finally {
    yield put(createParticipantsEntitySet.finally(action.id));
  }
  return workerResponse;
}

function* createParticipantsEntitySetWatcher() :Generator<*, *, *> {
  yield takeEvery(CREATE_PARTICIPANTS_ENTITY_SET, createParticipantsEntitySetWorker);
}

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

    const studies :Map<UUID, Map> = fromJS(response.data)
      .toMap()
      .mapKeys((index :number, study :Map) => study.getIn([STUDY_ID, 0]));
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
    let { newStudyData } = value;
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
    newStudyData = setIn(
      newStudyData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, OPENLATTICE_ID_FQN)], entityKeyId
    );

    yield put(createStudy.success(id, newStudyData));
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
  createParticipantsEntitySetWatcher,
  createStudyWatcher,
  getStudiesWatcher,
  getStudiesWorker,
};
