// @flow

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { Map, fromJS } from 'immutable';
import { Constants } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_CHRONICLE_APPS_DATA,
  SUBMIT_SURVEY,
  getChronicleAppsData,
  submitSurvey,
} from './SurveyActions';

import Logger from '../../utils/Logger';
import * as ChronicleApi from '../../utils/api/ChronicleApi';
import { getParticipantUserAppsUrl } from '../../utils/AppUtils';

const { OPENLATTICE_ID_FQN } = Constants;
const LOG = new Logger('SurveySagas');

/*
 *
 * SurveyActions.submitSurvey()
 *
 */
function* submitSurveyWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(submitSurvey.request(action.id));

    const { value } = action;
    const { participantId, studyId, appsData } = value;

    const url = getParticipantUserAppsUrl(participantId, studyId);
    if (!url) throw new Error('Invalid Url');

    const associationData :Map = Map().withMutations((map) => {
      appsData.forEach((entry, key) => {
        map.set(key, entry.get('associationDetails').delete(OPENLATTICE_ID_FQN));
      });
    });

    const response = yield call(ChronicleApi.updateAppsUsageAssociationData, url, associationData.toJS());
    if (response.error) throw response.error;

    yield put(submitSurvey.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(submitSurvey.failure(action.id));
  }
  finally {
    yield put(submitSurvey.finally(action.id));
  }
}

function* submitSurveyWatcher() :Generator<*, *, *> {
  yield takeEvery(SUBMIT_SURVEY, submitSurveyWorker);
}

/*
 *
 * SurveyActions.getChronicleApps()
 *
 */
function* getChronicleUserAppsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(getChronicleAppsData.request(action.id));

    const { value } = action;
    const { participantId, studyId } = value;

    const url = getParticipantUserAppsUrl(participantId, studyId);
    if (!url) throw new Error('Invalid Url');

    const response = yield call(ChronicleApi.getParticipantAppsUsageData, url);
    if (response.error) throw response.error;

    // mapping from association EKID -> associationDetails & entityDetails
    let appsData = fromJS(response.data)
      .toMap()
      .mapKeys((index, entity) => entity.getIn(['associationDetails', OPENLATTICE_ID_FQN, 0]));

    // set id property (needed by LUK table)
    appsData = appsData.map((entity, id) => entity.set('id', id));

    yield put(getChronicleAppsData.success(action.id, appsData));
  }

  catch (error) {
    LOG.error(action.type, error);
    yield put(getChronicleAppsData.failure(action.id));
  }
  finally {
    yield put(getChronicleAppsData.finally(action.id));
  }
}

function* getChronicleUserAppsWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_CHRONICLE_APPS_DATA, getChronicleUserAppsWorker);
}

export {
  getChronicleUserAppsWatcher,
  submitSurveyWatcher
};
