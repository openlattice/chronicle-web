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
  getQuestionnaire
} from './QuestionnaireActions';

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

    const response = yield call(ChronicleApi.getQuestionnaireMetadata, studyId, questionnaireId);
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

export {
  getQuestionnaireWatcher,
  getQuestionnaireWorker
};
