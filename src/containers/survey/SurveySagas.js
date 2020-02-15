// @flow

import axios from 'axios';
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
import { getParticipantUserAppsUrl } from '../../utils/api/AppApi';

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

    if (url === null) throw new Error('Invalid Url');

    let associationData :Map = Map().withMutations((map) => {
      appsData.forEach((entry, key) => {
        map.set(key, entry.get('associationDetails'));
      });
    });

    // delete entity key since it won't be used in DataApi.updateEntitiesInEntitySet()
    associationData = associationData
      .map((entity) => entity.delete(OPENLATTICE_ID_FQN));

    /* send POST request to update chronicle_used_by associations
     * url: chronicle/study/participant/data/<study_id>/<participant_id>/apps
     * requestBody:
        {
          EKID_1: {
            FQN1: [value1],
            FQN2: [value2]
          },
          EKID_1: {
            FQN1: [value3],
            FQN2: [value4]
          },
        }
     */

    const axiosRequestBody :Object = associationData.toJS();

    const response = yield call(axios, {
      method: 'post',
      data: axiosRequestBody,
      url,
    });
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

    /*
     * send GET request to chronicle server to get neighbors of participant_id
     * associated by chroncile_user_apps.
     * endpoint: chronicle/study/participant/data/<study_id>/<participant_id>/apps
     * response data:
          [
            {
              entityDetails: {
                FQN1: [value1],
                FQN2: [value2]
             },
             associationDetails: {
                FQN3: [value3],
                FQN4: [value4]
             },
            }
          ]
     */
    const url = getParticipantUserAppsUrl(participantId, studyId);
    if (url === null) throw new Error('Invalid url');

    const response = yield call(axios, {
      method: 'get',
      url,
    });
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
