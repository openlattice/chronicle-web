// @flow

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { deleteIn, setIn, set } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import type { SequenceAction } from 'redux-reqseq';

import {
  CREATE_QUESTIONNAIRE,
  createQuestionnaire
} from './QuestionnairesActions';
import { createRecurrenceRuleSetFromFormData } from './utils/utils';
import { submitDataGraph } from '../../core/sagas/data/DataActions';
import { submitDataGraphWorker } from '../../core/sagas/data/DataSagas';

import {
  createQuestionnaireAssociations,
  createQuestionEntitiesFromFormData,
} from './utils/dataUtils';

import Logger from '../../utils/Logger';
import { ENTITY_SET_NAMES } from '../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const {
  getPageSectionKey,
  getEntityAddressKey,
  processAssociationEntityData,
  processEntityData
} = DataProcessingUtils;


const LOG = new Logger('QuestionnairesSagas');

const { QUESTIONNAIRE_ES_NAME } = ENTITY_SET_NAMES;
const { RRULE_FQN } = PROPERTY_TYPE_FQNS;

function* createQuestionnaireWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(createQuestionnaire.request(action.id));

    const { studyEKID } = action.value;
    let { formData } = action.value;

    const entitySetIds = yield select((state) => state.getIn(['edm', 'entitySetIds']));
    const propertyTypeIds = yield select((state) => state.getIn(['edm', 'propertyTypeIds']));

    // generate rrule from form data
    const rruleSet = createRecurrenceRuleSetFromFormData(formData);

    // update formdata with rrule
    let psk = getPageSectionKey(1, 1);
    const eak = getEntityAddressKey(0, QUESTIONNAIRE_ES_NAME, RRULE_FQN);
    formData = setIn(formData, [psk, eak], rruleSet);

    // remove scheduler from from form data
    psk = getPageSectionKey(3, 1);
    delete formData[psk];

    // transform form data
    const questionEntities = createQuestionEntitiesFromFormData(formData);
    psk = getPageSectionKey(2, 1);
    formData = set(formData, psk, questionEntities);

    const entityData = processEntityData(
      formData,
      entitySetIds,
      propertyTypeIds
    );

    // associations
    const associations = createQuestionnaireAssociations(formData, studyEKID);
    console.log(studyEKID);
    console.log(associations);
    const associationEntityData = processAssociationEntityData(
      associations,
      entitySetIds,
      propertyTypeIds
    );

    console.log(entityData);
    console.log(associationEntityData);
    const response = yield call(submitDataGraphWorker, submitDataGraph({ associationEntityData, entityData }));
    if (response.error) throw response.error;
    console.log(response);

    // TODO: reconstruct questionnaire + questions and put that somewhere in redux
    yield put(createQuestionnaire.success(action.id));

  }
  catch (error) {
    yield put(createQuestionnaire.failure(action.id));
    LOG.error(action.type, error);
  }
  finally {
    yield put(createQuestionnaire.finally(action.id));
  }
}

function* createQuestionnaireWatcher() :Generator<*, *, *> {
  yield takeEvery(CREATE_QUESTIONNAIRE, createQuestionnaireWorker);
}

export {
  createQuestionnaireWatcher
};
