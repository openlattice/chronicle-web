// @flow

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { fromJS } from 'immutable';
import { Constants } from 'lattice';
import { Logger } from 'lattice-utils';
import { DateTime } from 'luxon';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_CHRONICLE_APPS_DATA,
  SUBMIT_SURVEY,
  getChronicleAppsData,
  submitSurvey,
} from './SurveyActions';
import { createSubmissionData, getAppNameFromUserAppsEntity, getMinimumDate } from './utils';

import * as ChronicleApi from '../../utils/api/ChronicleApi';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { OPENLATTICE_ID_FQN } = Constants;
const LOG = new Logger('SurveySagas');

const { DATE_TIME_FQN, TITLE_FQN } = PROPERTY_TYPE_FQNS;

/*
 *
 * SurveyActions.submitSurvey()
 *
 */
function* submitSurveyWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(submitSurvey.request(action.id));

    const { value } = action;
    const {
      formData,
      organizationId,
      participantId,
      studyId,
    } = value;

    const submissionData = createSubmissionData(formData);

    const response = yield call(
      ChronicleApi.updateAppsUsageAssociationData, organizationId, studyId, participantId, submissionData
    );
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
    const {
      date,
      participantId,
      studyId,
      organizationId
    } = value;

    const response = yield call(ChronicleApi.getParticipantAppsUsageData, date, participantId, studyId, organizationId);
    if (response.error) throw response.error;

    // mapping from association EKID -> associationDetails & entityDetails
    const appsData = fromJS(response.data)
      .toMap()
      .mapKeys((index, entity) => entity.getIn(['associationDetails', OPENLATTICE_ID_FQN, 0]))
      .map((entity, id) => entity.set('id', id))
      .map((entity) => entity.setIn(['entityDetails', TITLE_FQN, 0], getAppNameFromUserAppsEntity(entity)))
      .map((entity) => entity.setIn(['associationDetails', DATE_TIME_FQN],
        [getMinimumDate(entity.getIn(['associationDetails', DATE_TIME_FQN]))]))
      .sortBy((entity) => DateTime.fromISO(entity.getIn(['associationDetails', DATE_TIME_FQN, 0])));

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
