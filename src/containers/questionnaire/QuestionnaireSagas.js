// @flow

import {
  call,
  put,
  takeEvery
} from '@redux-saga/core/effects';
import { fromJS } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_QUESTIONNAIRE,
  SUBMIT_QUESTIONNAIRE,
  getQuestionnaire,
  submitQuestionnaire,
} from './QuestionnaireActions';
import { getQuestionAnswerMapping } from './utils/utils';

import Logger from '../../utils/Logger';
import * as ChronicleApi from '../../utils/api/ChronicleApi';

const LOG = new Logger('QuestionnaireSagas');

/*
 *
 * QuestionnaireActions.getQuestionnaire()
 *
 */
function* getQuestionnaireWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(getQuestionnaire.request(action.id));

    const { studyId, questionnaireId } = action.value;

    const response = yield call(ChronicleApi.getQuestionnaire, studyId, questionnaireId);
    if (response.error) throw response.error;

    yield put(getQuestionnaire.success(action.id, fromJS(response.data)));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getQuestionnaire.failure(action.id));
  }
  finally {
    yield put(getQuestionnaire.finally(action.id));
  }
}

function* getQuestionnaireWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_QUESTIONNAIRE, getQuestionnaireWorker);
}

function* submitQuestionnaireWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(submitQuestionnaire.request(action.id));

    const { formData, participantId, studyId } = action.value;
    const questionAnswerMapping = getQuestionAnswerMapping(formData);

    const response = yield call(ChronicleApi.submitQuestionnaire, studyId, participantId, questionAnswerMapping);
    if (!response.data) throw new Error('Submission failed');

    yield put(submitQuestionnaire.success(action.id));

  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitQuestionnaire.failure(action.id));
  }
  finally {
    yield put(submitQuestionnaire.finally(action.id));
  }
}

function* submitQuestionnaireWatcher() :Generator<*, *, *> {
  yield takeEvery(SUBMIT_QUESTIONNAIRE, submitQuestionnaireWorker);
}

export {
  getQuestionnaireWatcher,
  submitQuestionnaireWatcher
};
