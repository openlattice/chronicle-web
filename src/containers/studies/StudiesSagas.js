/*
 * @flow
 */

import uuid from 'uuid/v4';
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import {
  Map,
  fromJS,
  getIn,
  setIn,
} from 'immutable';
import { Constants, Models } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';
import {
  DataApiActions,
  DataApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas,
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
import { selectEntityTypeId } from '../../core/edm/EDMUtils';
import { ENTITY_SET_NAMES, PARTICIPANTS_PREFIX } from '../../core/edm/constants/EntitySetNames';
import { ENTITY_TYPE_FQNS, PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { submitDataGraph } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker } from '../../core/sagas/data/DataSagas';

const { getEntitySetDataWorker } = DataApiSagas;
const { getEntitySetData } = DataApiActions;
const { getPageSectionKey, getEntityAddressKey, processEntityData } = DataProcessingUtils;
const { createEntitySetsWorker } = EntitySetsApiSagas;
const { createEntitySets } = EntitySetsApiActions;
const { EntitySetBuilder } = Models;

const { OPENLATTICE_ID_FQN } = Constants;

const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const { STUDY_ID, STUDY_NAME, STUDY_EMAIL } = PROPERTY_TYPE_FQNS;
const { PERSON } = ENTITY_TYPE_FQNS;

const LOG = new Logger('StudiesSagas');

/*
 *
 * StudiesActions.createParticipantsEntitySet()
 *
 */

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

/*
 *
 * StudiesActions.addStudyParticipant()
 *
 */

function* addStudyParticipantWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(addStudyParticipant.request(action.id));

    const { value } = action;
    const { entitySetId, entitySetName, studyId } = value;
    let { newFormData } = value;

    const response = yield call(submitDataGraphWorker, submitDataGraph(value));
    if (response.error) throw response.error;

    const { entityKeyIds } = response.data;
    const entityKeyId = entityKeyIds[entitySetId][0];
    newFormData = setIn(
      newFormData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, entitySetName, OPENLATTICE_ID_FQN)], entityKeyId
    );

    yield put(addStudyParticipant.success(action.id, { newFormData, studyId, entitySetName }));
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

/*
 *
 * StudiesActions.getStudies()
 *
 */

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

function* getStudiesWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_STUDIES, getStudiesWorker);
}

/*
 *
 * StudiesActions.createStudy()
 *
 */

function* createStudyWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(createStudy.request(action.id));

    let { value: formData } = action;

    // generate a random study id
    formData = setIn(
      formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID)],
      uuid(),
    );

    // create a new participant entity set for the new study
    let response = yield call(createParticipantsEntitySetWorker, createParticipantsEntitySet(formData));
    if (response.error) throw response.error;

    const { entitySetIds, propertyTypeIds } = yield select((state) => ({
      entitySetIds: state.getIn(['edm', 'entitySetIds']),
      propertyTypeIds: state.getIn(['edm', 'propertyTypeIds']),
    }));

    let entityData = processEntityData(formData, entitySetIds, propertyTypeIds);
    response = yield call(submitDataGraphWorker, submitDataGraph({ associationEntityData: {}, entityData }));
    if (response.error) throw response.error;

    const entitySetId :UUID = entitySetIds.get(CHRONICLE_STUDIES);
    const entityKeyId :UUID = getIn(response.data, ['entityKeyIds', entitySetId, 0]);

    // update the study entity with its entity key id
    formData = setIn(
      formData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, OPENLATTICE_ID_FQN)],
      entityKeyId,
    );
    entityData = processEntityData(formData, entitySetIds, propertyTypeIds.map((id, fqn) => fqn));

    const studyEntityData = getIn(entityData, [entitySetId, 0]);
    yield put(createStudy.success(action.id, studyEntityData));
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

export {
  addStudyParticipantWatcher,
  addStudyParticipantWorker,
  createParticipantsEntitySetWatcher,
  createParticipantsEntitySetWorker,
  createStudyWatcher,
  getStudiesWatcher,
  getStudiesWorker,
};
