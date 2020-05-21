// @flow
import {
  all,
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import {
  Map,
  Set,
  fromJS,
  getIn,
  get
} from 'immutable';
import { Models, Types } from 'lattice';
import {
  AuthorizationsApiActions,
  AuthorizationsApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas,
  PermissionsApiActions,
  PermissionsApiSagas
} from 'lattice-sagas';
import type { FQN } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_NOTIFICATIONS_AUTHORIZATIONS,
  GET_STUDY_AUTHORIZATIONS,
  UPDATE_ES_PERMISSIONS,
  getNotificationsAuthorizations,
  getStudyAuthorizations,
  updateEntitySetPermissions,
} from './PermissionsActions';

import Logger from '../../utils/Logger';
import {
  getNotificationsEntitySetName,
  getPartOfAssociationEntitySetName
} from '../../utils/NotificationsUtils';
import { getParticipantsEntitySetName } from '../../utils/ParticipantUtils';
import { selectEntityType } from '../edm/EDMUtils';
import { PROPERTY_TYPE_FQNS } from '../edm/constants/FullyQualifiedNames';

const { STUDY_ID } = PROPERTY_TYPE_FQNS;

const {
  ActionTypes,
  PermissionTypes,
  PrincipalTypes,
} = Types;

const { updateAcls } = PermissionsApiActions;
const { updateAclsWorker } = PermissionsApiSagas;

const { getEntitySetIdWorker } = EntitySetsApiSagas;
const { getEntitySetId } = EntitySetsApiActions;

const { getAuthorizationsWorker } = AuthorizationsApiSagas;
const { getAuthorizations } = AuthorizationsApiActions;

const {
  Ace,
  AceBuilder,
  Acl,
  AclBuilder,
  AccessCheck,
  AclData,
  AclDataBuilder,
  Principal,
  PrincipalBuilder,
  AccessCheckBuilder
} = Models;

const LOG = new Logger('PermissionsSagas');
const DEFAULT_USER_PRINCIPAL_ID = 'auth0|5ae9026c04eb0b243f1d2bb6';


const createAclData = (aclKey :Array<UUID>) :AclData => {
  const permissions = [PermissionTypes.READ, PermissionTypes.WRITE];

  const principal :Principal = new PrincipalBuilder()
    .setId(DEFAULT_USER_PRINCIPAL_ID)
    .setType(PrincipalTypes.USER)
    .build();

  const ace :Ace = new AceBuilder()
    .setPermissions(permissions)
    .setPrincipal(principal)
    .build();

  const acl :Acl = new AclBuilder()
    .setAces([ace])
    .setAclKey(aclKey)
    .build();

  const aclData :AclData = new AclDataBuilder()
    .setAcl(acl)
    .setAction(ActionTypes.ADD)
    .build();

  return aclData;
};

/*
 *
 * PermissionsActions.updateEntitySetPermissions()
 *
 */

function* updateEntitySetPermissionsWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse = {};

  try {
    yield put(updateEntitySetPermissions.request(action.id));

    const { value } = action;
    const { entityTypeFQN, entitySetId } :{ entityTypeFQN :FQN, entitySetId :UUID } = value;

    const entityType = yield select(selectEntityType(entityTypeFQN));

    const aclData :AclData[] = [];

    entityType.get('properties').forEach((propertyTypeId :UUID) => {
      const aclKey = [entitySetId, propertyTypeId];
      const aclDataItem = createAclData(aclKey);
      aclData.push(aclDataItem);
    });

    const aclKey = [entitySetId];
    const aclDataItem = createAclData(aclKey);
    aclData.push(aclDataItem);

    const response = yield call(updateAclsWorker, updateAcls(aclData));
    if (response.error) throw response.error;

    yield put(updateEntitySetPermissions.success(action.id));
  }

  catch (error) {
    LOG.error(action.type, error);
    workerResponse.error = error;
    yield put(updateEntitySetPermissions.failure(action.id));
  }

  finally {
    yield put(updateEntitySetPermissions.finally(action.id));
  }
  return workerResponse;
}

function* updateEntitySetPermissionsWatcher() :Generator<*, *, *> {
  yield takeEvery(UPDATE_ES_PERMISSIONS, updateEntitySetPermissionsWorker);
}

/*
 *
 * PermissionsActions.getStudyAuthorizations()
 *
 */

function* getStudyAuthorizationsWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse = {};
  try {
    yield put(getStudyAuthorizations.request(action.id));

    const { studies, permissions } = action.value;

    const studyIds = studies.map((study) => study.getIn([STUDY_ID, 0]));
    const entitySetNames = studyIds.map((studyId) => getParticipantsEntitySetName(studyId));

    const responses :Object[] = yield all(
      entitySetNames.toJS().map((entitySetName) => call(getEntitySetIdWorker, getEntitySetId(entitySetName)))
    );

    // look up map: participant entity setIds -> study Ids
    const authorizedEntitySetIdsStudyIdMap :Map<UUID, UUID> = Map().withMutations((map :Map) => {
      responses.forEach((response, index) => {
        if (!response.error) {
          map.set(response.data, studyIds.get(index));
        }
      });
    });

    const accessChecks :AccessCheck[] = fromJS(authorizedEntitySetIdsStudyIdMap)
      .keySeq()
      .map((entitySetId) => (
        new AccessCheckBuilder()
          .setAclKey([entitySetId])
          .setPermissions(permissions)
          .build()
      ))
      .toJS();

    const response = yield call(getAuthorizationsWorker, getAuthorizations(accessChecks));
    if (response.error) throw response.error;
    const studyAuthorizations = response.data;

    const authorizedStudyIds :Set<UUID> = Set().withMutations((set :Set) => {
      studyAuthorizations.forEach((authorization) => {
        if (getIn(authorization, ['permissions', PermissionTypes.READ], false)) {
          const entitySetId = getIn(authorization, ['aclKey', 0]);
          set.add(authorizedEntitySetIdsStudyIdMap.get(entitySetId));
        }
      });
    });

    workerResponse.data = authorizedStudyIds;

    yield put(getStudyAuthorizations.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(getStudyAuthorizations.failure(action.id));
  }
  finally {
    yield put(getStudyAuthorizations.finally(action.id));
  }
  return workerResponse;
}

function* getStudyAuthorizationsWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_STUDY_AUTHORIZATIONS, getStudyAuthorizations);
}

/*
 *
 * PermissionsActions.getNotificationsAuthorizations()
 *
 */

function* getNotificationsAuthorizationsWorker(action :SequenceAction) :Generator<*, *, *> {
  const workerResponse = {};
  try {
    yield put(getNotificationsAuthorizations.request(action.id));

    const studyIds :string[] = action.value;

    const partOfEntitySetNames = studyIds.map((studyId) => getPartOfAssociationEntitySetName(studyId));
    const notificationEntitySetName = studyIds.map((studyId) => getNotificationsEntitySetName(studyId));

    const calls = partOfEntitySetNames.concat(notificationEntitySetName).reduce((result, esName :string) => ({
      ...result,
      [esName]: call(getEntitySetIdWorker, getEntitySetId(esName))
    }), {});
    const response = yield all(calls);

    const partOfEntitySetIds = [];
    const notificationEntitySetIds = [];
    const unauthorizedStudyIds = [];

    Object.entries(response).forEach(([esName, value]) => {
      const tokens = esName.split('_');

      const error = get(value, 'error');
      const data = get(value, 'data');

      if (error instanceof Error) {
        if (error.response.status === 401 && error.response.statusText === 'Unauthorized') {
          unauthorizedStudyIds.push(tokens[2]);
        }
      }

      if (data && !unauthorizedStudyIds.includes(tokens[2])) {
        if (tokens[1] === 'partof') {
          partOfEntitySetIds.push(data);
        }
        else {
          notificationEntitySetIds.push(data);
        }
      }
    });

    workerResponse.data = { unauthorizedStudyIds, notificationEntitySetIds, partOfEntitySetIds };

    yield put(getNotificationsAuthorizations.success(action.id));
  }
  catch (error) {
    workerResponse.error = error;
    yield put(getNotificationsAuthorizations.failure(action.id));
  }
  finally {
    yield put(getNotificationsAuthorizations.finally(action.id));
  }

  return workerResponse;
}

function* getNotificationsAuthorizationsWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_NOTIFICATIONS_AUTHORIZATIONS, getNotificationsAuthorizationsWorker);
}

export {
  getNotificationsAuthorizationsWatcher,
  getNotificationsAuthorizationsWorker,
  getStudyAuthorizationsWatcher,
  getStudyAuthorizationsWorker,
  updateEntitySetPermissionsWatcher,
  updateEntitySetPermissionsWorker,
};
