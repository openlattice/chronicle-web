/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';

import * as DataSagas from './data/DataSagas';

import * as AppSagas from '../../containers/app/AppSagas';
import * as EDMSagas from '../edm/EDMSagas';
import * as QuestionnaireSagas from '../../containers/questionnaire/QuestionnaireSagas';
import * as RoutingSagas from '../router/RoutingSagas';
import * as StudiesSagas from '../../containers/studies/StudiesSagas';
import * as SurveySagas from '../../containers/survey/SurveySagas';
import * as TimeUseDiarySagas from '../../containers/tud/TimeUseDiarySagas';

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
    fork(StudiesSagas.getStudiesWatcher),
    fork(StudiesSagas.getStudyParticipantsWatcher),
    fork(StudiesSagas.updateStudyWatcher),

    // survey
    fork(SurveySagas.getChronicleUserAppsWatcher),
    fork(SurveySagas.submitSurveyWatcher),

    // questionnaire
    fork(QuestionnaireSagas.changeActiveStatusWatcher),
    fork(QuestionnaireSagas.createQuestionnaireWatcher),
    fork(QuestionnaireSagas.deleteQuestionnaireWatcher),
    fork(QuestionnaireSagas.downloadQuestionnaireResponsesWatcher),
    fork(QuestionnaireSagas.getQuestionnaireResponsesWatcher),
    fork(QuestionnaireSagas.getQuestionnaireWatcher),
    fork(QuestionnaireSagas.getStudyQuestionnairesWatcher),
    fork(QuestionnaireSagas.submitQuestionnaireWatcher),

    // time use diary
    fork(TimeUseDiarySagas.submitTudDataWatcher)
  ]);
}
