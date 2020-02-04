// @flow

import { takeEvery, call, put } from '@redux-saga/core/effects';
import type { SequenceAction } from 'redux-reqseq';
import { fromJS, Map } from 'immutable';
import axios from 'axios';
import {
  GET_CHRONICLE_USER_APPS,
  getChronicleUserApps
} from './SurveyActions';
import Logger from '../../utils/Logger';
import { getParticipantUserAppsUrl } from '../../utils/api/AppApi';

const LOG = new Logger('Survey Sagas');

function* getChronicleUserAppsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(getChronicleUserApps.request(action.id));

    const { value } = action;
    const { participantId, studyId } = value;

    /*
     * send GET request to chronicle server to get neighbors of participant_id
     * associated by chroncile_user_apps
     * endpoint: chronicle/study/participant/data/<study_id>/<participant_id>/apps
     */
    const url = getParticipantUserAppsUrl(participantId, studyId);
    if (url === null) throw new Error('Invalid url');

    const response = yield call(axios, {
      method: 'get',
      url,
      headers: {
      }
    });

    // create a map app_id -> neighbor
    const userApps = fromJS(response.data)
      .toMap()
      .mapKeys((index :number, neighbor :Map) => neighbor.get('neighborId'));

    yield put(getChronicleUserApps.success(action.id, userApps));
  }

  catch (error) {
    LOG.error(action.type, error);
    yield put(getChronicleUserApps.failure(action.id));
  }
  finally {
    yield put(getChronicleUserApps.finally(action.id));
  }
}

function* getChronicleUserAppsWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_CHRONICLE_USER_APPS, getChronicleUserAppsWorker);
}

export {
  getChronicleUserAppsWatcher
};
