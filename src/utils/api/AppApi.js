// @flow

import ENV_URLS from '../constants/EnvUrls';
import Logger from '../Logger';
import { isValidUUID } from '../ValidationUtils';
import {
  CHRONICLE,
  DATA,
  FILE_TYPE,
  PARTICIPANT,
  STUDY,
} from '../constants/UrlConstants';
import EnvTypes from '../constants/EnvTypes';

const LOG = new Logger('AppApi');
const { LOCAL, PRODUCTION, STAGING } = EnvTypes;

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

// return <baseUrl>/study/participant/data/<studyId>/<participantEntityKeyId>?fileType=csv
const getParticipantsDataUrl = (participantEntityKeyId :UUID, studyId :UUID) => {
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
  return `${baseUrl}/${CHRONICLE}/${STUDY}/${PARTICIPANT}/${DATA}`
    + `/${studyId}/${participantEntityKeyId}`
    + `?${FILE_TYPE}=csv`;
};

export { getBaseUrl, getParticipantsDataUrl };
