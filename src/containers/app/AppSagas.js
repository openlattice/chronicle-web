/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { push } from 'connected-react-router';
import { AccountUtils } from 'lattice-auth';
import { AppApiActions, AppApiSagas } from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_APP_SETTINGS,
  GET_CONFIGS,
  INITIALIZE_APPLICATION,
  SWITCH_ORGANIZATION,
  getAppSettings,
  getConfigs,
  initializeApplication,
  switchOrganization
} from './AppActions';

import * as AppModules from '../../utils/constants/AppModules';
import * as ChronicleApi from '../../utils/api/ChronicleApi';
import * as Routes from '../../core/router/Routes';
import { getEntityDataModelTypes } from '../../core/edm/EDMActions';
import { getEntityDataModelTypesWorker } from '../../core/edm/EDMSagas';
import { getDeletePermission } from '../../core/permissions/PermissionsActions';
import { getDeletePermissionWorker } from '../../core/permissions/PermissionsSagas';
import { processAppConfigs } from '../../utils/AppUtils';
import { ERR_MISSING_CORE_MODULE } from '../../utils/Errors';
import { getNotificationsEntity, getStudies } from '../studies/StudiesActions';
import { getNotificationsEntityWorker, getStudiesWorker } from '../studies/StudiesSagas';

const { getApp, getAppConfigs } = AppApiActions;
const { getAppWorker, getAppConfigsWorker } = AppApiSagas;

const LOG = new Logger('AppSagas');

function* getConfigsWorker(action :SequenceAction) :Saga<*> {
  const workerResponse = {};
  try {

    yield put(getConfigs.request(action.id));

    // get app modules
    const appModulesRes = yield all(
      [
        AppModules.CHRONICLE_CORE,
        AppModules.DATA_COLLECTION,
        AppModules.QUESTIONNAIRES
      ].reduce((obj, moduleName :string) => ({
        [moduleName]: call(getAppWorker, getApp(moduleName)),
        ...obj
      }), {})
    );

    // if core module is missing throw an error
    if (appModulesRes[AppModules.CHRONICLE_CORE].error) {
      throw ERR_MISSING_CORE_MODULE;
    }

    const appConfigsRes = yield all(
      Object.values(appModulesRes).reduce((obj, res :Object) => ({
        [res.data.name]: call(getAppConfigsWorker, getAppConfigs(res.data.id)),
        ...obj
      }), {})
    );

    // check if any of the responses has error
    // $FlowFixMe
    const error :?Object = Object.values(appModulesRes).flat().find((item) => Object.keys(item).includes('error'));
    if (error) throw error.error;

    const {
      appModulesOrgListMap,
      entitySetIdsByOrgId,
      organizations,
    } = processAppConfigs(appConfigsRes);

    yield put(getConfigs.success(action.id, {
      entitySetIdsByOrgId,
      appModulesOrgListMap,
      organizations,
    }));
  }
  catch (error) {
    workerResponse.error = error;
    LOG.error(action.type, error);
    yield put(getConfigs.failure(action.id));
  }

  return workerResponse;
}

function* getConfigsWatcher() :Saga<*> {

  yield takeEvery(GET_CONFIGS, getConfigsWorker);
}

/*
 *
 * AppActions.initializeApplication()
 *
 */

function* initializeApplicationWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(initializeApplication.request(action.id));

    const [edmResponse, configsResponse] :Object[] = yield all([
      call(getEntityDataModelTypesWorker, getEntityDataModelTypes()),
      call(getConfigsWorker, getConfigs())
    ]);
    if (edmResponse.error) throw edmResponse.error;
    if (configsResponse.error) throw configsResponse.error;

    // get entity key id of entity in global notifications entity set
    const notificationsRes = yield call(getNotificationsEntityWorker, getNotificationsEntity());
    if (notificationsRes.error) throw notificationsRes.error;

    // get studies
    const studiesRes = yield call(getStudiesWorker, getStudies());
    if (studiesRes.error) throw studiesRes.error;

    yield call(getDeletePermissionWorker, getDeletePermission());

    yield put(initializeApplication.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(initializeApplication.failure(action.id, error));
  }
  finally {
    yield put(initializeApplication.finally(action.id));
  }
}

function* initializeApplicationWatcher() :Generator<*, *, *> {

  yield takeEvery(INITIALIZE_APPLICATION, initializeApplicationWorker);
}

function* switchOrganizationWorker(action :SequenceAction) :Saga<*> {
  try {
    yield put(switchOrganization.request(action.id));

    AccountUtils.storeOrganizationId(action.value);
    yield put(push(Routes.ROOT));
    yield call(initializeApplicationWorker, initializeApplication());

    yield put(switchOrganization.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(switchOrganization.failure(action.id));
  }
}

function* switchOrganizationWatcher() :Saga<*> {
  yield takeEvery(SWITCH_ORGANIZATION, switchOrganizationWorker);
}

function* getAppSettingsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(getAppSettings.request(action.id));

    const { organizationId, appName } = action.value;

    const response = yield call(ChronicleApi.getAppSettings, organizationId, appName);

    yield put(getAppSettings.success(action.id, { organizationId, appName, settings: response.data }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getAppSettings.failure(action.id));
  }
  finally {
    yield put(getAppSettings.finally(action.id));
  }
}

function* getAppSettingsWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_APP_SETTINGS, getAppSettingsWorker);
}

export {
  getAppSettingsWatcher,
  getConfigsWatcher,
  initializeApplicationWatcher,
  initializeApplicationWorker,
  switchOrganizationWatcher,
};
