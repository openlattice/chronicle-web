// @flow

import ENV_URLS from './constants/EnvUrls';
import EnvTypes from './constants/EnvTypes';
import Logger from './Logger';
import ParticipantDataTypes from './constants/ParticipantDataTypes';
import { isNonEmptyString } from './LangUtils';
import { isValidUUID } from './ValidationUtils';
import {
  CHRONICLE,
  DATA,
  FILE_TYPE,
  PARTICIPANT,
  STUDY,
} from './constants/UrlConstants';
import type { ParticipantDataType } from './constants/ParticipantDataTypes';

const LOG = new Logger('AppApi');
const { LOCAL, PRODUCTION, STAGING } = EnvTypes;
const { RAW } = ParticipantDataTypes;

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

  if (dataType === RAW) {
    return `${baseUrl}/${CHRONICLE}/${STUDY}/${PARTICIPANT}/${DATA}/`
    + `${studyId}/${participantEntityKeyId}?`
    + `${FILE_TYPE}=csv`;
  }

  return `${baseUrl}/${CHRONICLE}/${STUDY}/${PARTICIPANT}/${DATA}/`
    + `${studyId}/${participantEntityKeyId}/preprocessed?`
    + `${FILE_TYPE}=csv`;
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

export { getBaseUrl, getParticipantDataUrl, getParticipantUserAppsUrl };
