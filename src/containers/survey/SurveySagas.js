// @flow

import axios from 'axios';
import { call, put, takeEvery } from '@redux-saga/core/effects';
import { List, fromJS, Set } from 'immutable';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_CHRONICLE_APPS_DATA,
  SUBMIT_SURVEY,
  getChronicleAppsData,
  submitSurvey,
} from './SurveyActions';

import Logger from '../../utils/Logger';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getParticipantUserAppsUrl } from '../../utils/api/AppApi';

const { PERSON_ID } = PROPERTY_TYPE_FQNS;
const LOG = new Logger('Survey Sagas');

function* submitSurveyWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(submitSurvey.request(action.id));

    const { value } = action;
    const { participantId, studyId, appsData } = value;

    const url = getParticipantUserAppsUrl(participantId, studyId);

    if (url === null) throw new Error('Invalid Url');

    /*
     * Remove 'id' field property from payload.
     * The endpoint expects a list of NeighborEntityDetails objects with 6 properties:
     * "neighborDetails", "associationDetails", "src", "neighborEntitySet", "associationEntitySet",
     *" neighborId"
     *
     */
    const payload :Object[] = appsData.valueSeq().map((appData :List) => appData.delete('id')).toJS();

    // update chronicle_used_by association( chroncile_user_apps -> participant_ chronicle_participants)
    // with a set of nc.SubjectIdentification values (parent, child, parent_and_child).
    const response = yield call(axios, {
      method: 'post',
      data: payload,
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

function* getChronicleUserAppsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(getChronicleAppsData.request(action.id));

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
    });

    // mapping from neighborId -> entity details
    let appsData = fromJS(response.data)
      .toMap()
      .mapKeys((index, entity) => entity.get('neighborId'));

    // update each entity with id property (needed by LUK table)
    appsData = appsData.map((entity, id) => entity.set('id', id));
    appsData = appsData
      .map((entity) => entity
        .setIn(['associationDetails', PERSON_ID], Set(entity.getIn(['associationDetails', PERSON_ID]), Set())));

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
