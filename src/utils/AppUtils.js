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
  CHRONICLE,
  CSRF_TOKEN,
  DATA,
  FILE_TYPE,
  PARTICIPANT,
  QUESTIONNAIRE,
  STUDY,
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

// @dataType RAW : <baseUrl>/study/participant/data/<studyId>/<participantEntityKeyId>?fileType=csv
// @dataType RAW : <baseUrl>/study/participant/data/<studyId>/<participantEntityKeyId/preprocessed>?fileType=csv

const getParticipantDataUrl = (dataType :ParticipantDataType, participantEntityKeyId :UUID, studyId :UUID) => {
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

  return `${baseUrl}/${CHRONICLE}/${STUDY}/${AUTHENTICATED}/${PARTICIPANT}/${DATA}/`
  + `${studyId}/${participantEntityKeyId}${dataTypePath}`
  + `?${FILE_TYPE}=csv`
  + `&${CSRF_TOKEN}=${csrfToken}`;

};

const getParticipantUserAppsUrl = (participantId :string, studyId :UUID) => {

  if (!isValidUUID(studyId)) {
    LOG.error('studyId must be a valiud UUID', studyId);
    return null;
  }

  if (!isNonEmptyString(participantId)) {
    LOG.error('participant id must be a valid string', participantId);
    return null;
  }

  const baseUrl = getBaseUrl();

  return `${baseUrl}/${CHRONICLE}/${STUDY}/${PARTICIPANT}/${DATA}`
    + `/${studyId}/${participantId}/apps`;
};

const getDeleteParticipantPath = (participantId :string, studyId :UUID) => {
  if (!isValidUUID(studyId)) {
    LOG.error('studyId must be a valiud UUID', studyId);
    return null;
  }

  if (!isNonEmptyString(participantId)) {
    LOG.error('participant id must be a valid string', participantId);
    return null;
  }

  return `${getBaseUrl()}/${CHRONICLE}/${STUDY}/${AUTHENTICATED}/${studyId}/${participantId}`;
};

const getQuestionnaireUrl = (studyId :UUID, questionnaireEKID :UUID) => {
  if (!isValidUUID(studyId)) {
    LOG.error('studyId must be a valid UUID', studyId);
    return null;
  }

  if (!isValidUUID(questionnaireEKID)) {
    LOG.error('questionnaireEKID must be a valid UUID', questionnaireEKID);
    return null;
  }

  return `${getBaseUrl()}/${CHRONICLE}/${STUDY}/${studyId}/${QUESTIONNAIRE}/${questionnaireEKID}`;
};

const getSubmitQuestionnaireUrl = (studyId :UUID, participantId :string) => {
  if (!isValidUUID(studyId)) {
    LOG.error('studyId must be a valiud UUID', studyId);
    return null;
  }

  if (!isNonEmptyString(participantId)) {
    LOG.error('participant id must be a valid string', participantId);
    return null;
  }

  return `${getBaseUrl()}/${CHRONICLE}/${STUDY}/${studyId}/${participantId}/${QUESTIONNAIRE}`;
};

const processAppConfigs = (appConfigsByModule :Object) => {

  const organizations = {};
  const entitySetIdsByOrgId = {};
  const appModulesOrgListMap = Object.entries(appConfigsByModule).reduce((obj, [key :string, val :Object]) => ({
    // $FlowFixMe
    [key]: val.data.map((config) => config.organization.id),
    ...obj
  }), {});

  const appConfigs = Object.values(appConfigsByModule).map((val :Object) => val.data).flat();

  appConfigs.forEach((config) => {
    const { organization } = config;
    const { title, id: orgId } = organization;

    set(organizations, orgId, { title, id: orgId });

    const entities = Object.entries(config.config).reduce((result, [fqn, entity]) => ({
      // $FlowFixMe
      [fqn]: entity.entitySetId,
      ...result,
    }), {});

    update(entitySetIdsByOrgId, orgId, (soFar) => merge(soFar, entities));
  });

  return {
    entitySetIdsByOrgId,
    organizations,
    appModulesOrgListMap
  };
};

export {
  getBaseUrl,
  getParticipantDataUrl,
  getParticipantUserAppsUrl,
  getQuestionnaireUrl,
  getSubmitQuestionnaireUrl,
  processAppConfigs,
  getDeleteParticipantPath,
};
