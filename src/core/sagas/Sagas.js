/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';

import * as DataSagas from './data/DataSagas';

import * as AppSagas from '../../containers/app/AppSagas';
import * as EDMSagas from '../edm/EDMSagas';
import * as PermissionsSagas from '../permissions/PermissionsSagas';
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
    fork(AppSagas.getAppSettingsWatcher),
    fork(AppSagas.getConfigsWatcher),
    fork(AppSagas.initializeApplicationWatcher),
    fork(AppSagas.switchOrganizationWatcher),

    // DataSagas
    fork(DataSagas.submitDataGraphWatcher),
    fork(DataSagas.submitPartialReplaceWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),

    // studies sagas
    fork(StudiesSagas.addStudyParticipantWatcher),
    fork(StudiesSagas.changeEnrollmentStatusWatcher),
    fork(StudiesSagas.createStudyWatcher),
    fork(StudiesSagas.deleteStudyWatcher),
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

    // permissions
    fork(PermissionsSagas.getDeletePermissionWatcher),

    // time use diary
    fork(TimeUseDiarySagas.downloadAllDataWatcher),
    fork(TimeUseDiarySagas.downloadTudResponsesWatcher),
    fork(TimeUseDiarySagas.getSubmissionsByDateWatcher),
    fork(TimeUseDiarySagas.submitTudDataWatcher),
    fork(TimeUseDiarySagas.verifyTudLinkWatcher),
  ]);
}
