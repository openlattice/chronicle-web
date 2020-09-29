// @flow

import {
  call,
  put,
  takeEvery
} from '@redux-saga/core/effects';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import {
  SUBMIT_TUD_DATA,
  submitTudData
} from './TimeUseDiaryActions';
import { createSubmitRequestBody } from './utils';

import * as ChronicleApi from '../../utils/api/ChronicleApi';

const LOG = new Logger('TimeUseDiarySagas');

function* submitTudDataWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(submitTudData.request(action.id));
    const {
      participantId,
      studyId,
      formData
    } = action.value;

    const requestBody = createSubmitRequestBody(formData);

    const response = yield call(ChronicleApi.submitTudData, studyId, participantId, requestBody);
    if (response.error) throw response.error;

    yield put(submitTudData.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitTudData.failure(action.id));
  }
  finally {
    yield put(submitTudData.finally(action.id));
  }
}

function* submitTudDataWatcher() :Saga<*> {
  yield takeEvery(SUBMIT_TUD_DATA, submitTudDataWorker);
}

/* eslint-disable import/prefer-default-export */
export {
  submitTudDataWatcher
};
/* eslint-enable */
