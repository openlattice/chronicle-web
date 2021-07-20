/*
 * @flow
 */

import merge from 'lodash/merge';
import set from 'lodash/set';
import update from 'lodash/update';
import { AuthUtils } from 'lattice-auth';
import { LangUtils, Logger, ValidationUtils } from 'lattice-utils';

import ENV_URLS from './constants/EnvUrls';
import EnvTypes from './constants/EnvTypes';
import ParticipantDataTypes from './constants/ParticipantDataTypes';
import {
  AUTHENTICATED,
  BASE,
  CSRF_TOKEN,
  DATA,
  FILE_TYPE,
  QUESTIONNAIRE,
  SETTINGS,
  STATUS,
  TIME_USE_DIARY,
} from './constants/UrlConstants';
import type { ParticipantDataType } from './constants/ParticipantDataTypes';

const LOG = new Logger('AppUtils');

const { isNonEmptyString } = LangUtils;
const { isValidUUID } = ValidationUtils;

const { LOCAL, PRODUCTION, STAGING } = EnvTypes;
const { PREPROCESSED, APP_USAGE } = ParticipantDataTypes;

const getBaseUrl = () => {
  const { hostname } = window.location;
  if (hostname === 'localhost') {
    return ENV_URLS.get(LOCAL);
  }
  if (window.location.hostname.startsWith(STAGING)) {
    return ENV_URLS.get(STAGING);
  }
  return ENV_URLS.get(PRODUCTION);
};

// @dataType RAW : <baseUrl>/study/<orgId>/<studyId>/<participantEntityKeyId>/data?fileType=csv
// @dataType PREPROCESSED : <baseUrl>/study/<orgId>/<studyId>/<participantEntityKeyId>/data/preprocessed?fileType=csv
// @dataType USAGE : <baseUrl>/study/<orgId>/<studyId>/<participantEntityKeyId>/data/usage?fileType=csv

const getParticipantDataUrl = (
  dataType :ParticipantDataType,
  participantEntityKeyId :UUID,
  studyId :UUID,
  orgId :UUID
) => {
  // validation
  if (!isValidUUID(participantEntityKeyId)) {
    LOG.error('participantEntityKeyId must be a valid UUID', participantEntityKeyId);
    return null;
  }
  if (!isValidUUID(studyId)) {
    LOG.error('studyId must be a valiud UUID', studyId);
    return null;
  }

  const baseUrl = getBaseUrl();
  const csrfToken = AuthUtils.getCSRFToken() ?? '';
  let dataTypePath;

  switch (dataType) {
    case PREPROCESSED:
      dataTypePath = '/preprocessed';
      break;
    case APP_USAGE:
      dataTypePath = '/usage';
      break;
    default:
      dataTypePath = '';
      break;
  }

  return `${baseUrl}/${BASE}/${AUTHENTICATED}/`
  + `${orgId}/${studyId}/${participantEntityKeyId}/${DATA}${dataTypePath}`
  + `?${FILE_TYPE}=csv`
  + `&${CSRF_TOKEN}=${csrfToken}`;

};

const getParticipantUserAppsUrl = (participantId :string, studyId :UUID, orgId :UUID) => {

  if (!isValidUUID(studyId)) {
    LOG.error('studyId must be a valiud UUID', studyId);
    return null;
  }

  if (!isValidUUID(orgId)) {
    LOG.error('orgId must be a valiud UUID', orgId);
    return null;
  }

  if (!isNonEmptyString(participantId)) {
    LOG.error('participant id must be a valid string', participantId);
    return null;
  }

  const baseUrl = getBaseUrl();

  return `${baseUrl}/${BASE}/${orgId}/${studyId}/${participantId}/apps`;
};

const getDeleteParticipantPath = (orgId :UUID, participantId :string, studyId :UUID) => {
  if (!isValidUUID(studyId)) {
    LOG.error('studyId must be a valiud UUID', studyId);
    return null;
  }

  if (!isValidUUID(orgId)) {
    LOG.error('orgId must be a valiud UUID', orgId);
    return null;
  }

  if (!isNonEmptyString(participantId)) {
    LOG.error('participant id must be a valid string', participantId);
    return null;
  }

  return `${getBaseUrl()}/${BASE}/${AUTHENTICATED}/${orgId}/${studyId}/${participantId}`;
};

const getQuestionnaireUrl = (orgId :UUID, studyId :UUID, questionnaireEKID :UUID) => {
  if (!isValidUUID(studyId)) {
    LOG.error('studyId must be a valid UUID', studyId);
    return null;
  }

  if (!isValidUUID(orgId)) {
    LOG.error('orgId must be a valid UUID', orgId);
    return null;
  }

  if (!isValidUUID(questionnaireEKID)) {
    LOG.error('questionnaireEKID must be a valid UUID', questionnaireEKID);
    return null;
  }

  return `${getBaseUrl()}/${BASE}/${orgId}/${studyId}/${QUESTIONNAIRE}/${questionnaireEKID}`;
};

const getSubmitQuestionnaireUrl = (orgId :UUID, studyId :UUID, participantId :string) => {
  if (!isValidUUID(studyId)) {
    LOG.error('studyId must be a valiud UUID', studyId);
    return null;
  }

  if (!isValidUUID(orgId)) {
    LOG.error('orgId must be a valiud UUID', orgId);
    return null;
  }

  if (!isNonEmptyString(participantId)) {
    LOG.error('participant id must be a valid string', participantId);
    return null;
  }

  return `${getBaseUrl()}/${BASE}/${orgId}/${studyId}/${participantId}/${QUESTIONNAIRE}`;
};

const processAppConfigs = (appConfigsByModule :Object) => {

  const organizations = {};
  const entitySetIdsByOrgId = {};
  const appModulesOrgListMap = Object.entries(appConfigsByModule).reduce((obj, [key :string, val :Object]) => ({
    // $FlowFixMe
    [key]: val.data.map((config) => config.organization.id),
    ...obj
  }), {});

  Object.entries(appConfigsByModule).forEach(([appModule, val]) => {
    // $FlowFixMe
    const configs = val.data;
    configs.forEach((config) => {
      const { organization } = config;
      const { title, id: orgId } = organization;

      set(organizations, orgId, { title, id: orgId });

      const entities = Object.entries(config.config).reduce((result, [fqn, entity]) => ({
        // $FlowFixMe
        [fqn]: entity.entitySetId,
        ...result,
      }), {});

      update(entitySetIdsByOrgId, [appModule, orgId], (prev) => merge(prev, entities));
    });
  });

  return {
    entitySetIdsByOrgId,
    organizations,
    appModulesOrgListMap
  };
};

const getSubmitTudDataUrl = (orgId :UUID, studyId :UUID, participantId :string) => {
  if (!isValidUUID(orgId)) {
    LOG.error('orgId must be a valid UUID', orgId);
    return null;
  }

  if (!isValidUUID(studyId)) {
    LOG.error('studyId must be a valid UUID', studyId);
    return null;
  }

  if (!isNonEmptyString(participantId)) {
    LOG.error('participant id must be a valid string', participantId);
    return null;
  }

  return `${getBaseUrl()}/${BASE}/${orgId}/${studyId}/${participantId}/${TIME_USE_DIARY}`;
};

const getDeleteStudyUrl = (orgId :UUID, studyId :UUID) => {
  if (!isValidUUID(orgId)) {
    LOG.error('invalid orgId: ', orgId);
    return null;
  }
  if (!isValidUUID(studyId)) {
    LOG.error('invalid studyId: ', studyId);
    return null;
  }

  return `${getBaseUrl()}/${BASE}/${AUTHENTICATED}/${orgId}/${studyId}`;
};

const getEnrollmentStatusUrl = (organizationId :UUID, studyId :UUID, participantId :string) => {
  if (!isValidUUID(organizationId)) {
    LOG.error('invalid orgId: ', organizationId);
    return null;
  }
  if (!isValidUUID(studyId)) {
    LOG.error('invalid studyId: ', studyId);
    return null;
  }

  return `${getBaseUrl()}/${BASE}/${organizationId}/${studyId}/${participantId}/${STATUS}`;
};

const getAppSettingsUrl = (organizationId :UUID) => {
  if (!isValidUUID(organizationId)) {
    LOG.error('invalid orgId: ', organizationId);
    return null;
  }

  return `${getBaseUrl()}/${BASE}/${organizationId}/${SETTINGS}`;
};

export {
  getAppSettingsUrl,
  getBaseUrl,
  getDeleteParticipantPath,
  getDeleteStudyUrl,
  getEnrollmentStatusUrl,
  getParticipantDataUrl,
  getParticipantUserAppsUrl,
  getQuestionnaireUrl,
  getSubmitQuestionnaireUrl,
  getSubmitTudDataUrl,
  processAppConfigs,
};
