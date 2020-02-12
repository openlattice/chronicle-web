/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';

import * as DataSagas from './data/DataSagas';

import * as AppSagas from '../../containers/app/AppSagas';
import * as EDMSagas from '../edm/EDMSagas';
import * as RoutingSagas from '../router/RoutingSagas';
import * as StudiesSagas from '../../containers/studies/StudiesSagas';
import * as SurveySagas from '../../containers/survey/SurveySagas';

export default function* sagas() :Generator<*, *, *> {

  yield all([
    // "lattice-auth" sagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchLogout),

    // AppSagas
    fork(AppSagas.initializeApplicationWatcher),

    // DataSagas
    fork(DataSagas.submitDataGraphWatcher),
    fork(DataSagas.submitPartialReplaceWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),
    fork(EDMSagas.getAllEntitySetIdsWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),

    // studies sagas
    fork(StudiesSagas.addStudyParticipantWatcher),
    fork(StudiesSagas.changeEnrollmentStatusWatcher),
    fork(StudiesSagas.createParticipantsEntitySetWatcher),
    fork(StudiesSagas.createStudyWatcher),
    fork(StudiesSagas.deleteStudyParticipantWatcher),
    fork(StudiesSagas.getParticipantsEnrollmentStatusWatcher),
    fork(StudiesSagas.getStudiesWatcher),
    fork(StudiesSagas.getStudyParticipantsWatcher),
    fork(StudiesSagas.getStudyAuthorizationsWatcher),
    fork(StudiesSagas.updateStudyWatcher),

    // survey
    fork(SurveySagas.getChronicleUserAppsWatcher),
    fork(SurveySagas.submitSurveyWatcher)
  ]);
}
