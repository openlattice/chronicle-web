// @flow

import ENV_URLS from '../constants/EnvUrls';
import Logger from '../Logger';
import { isValidUUID } from '../ValidationUtils';
import {
  CHRONICLE,
  DATA,
  FILE_TYPE,
  LOCAL,
  PARTICIPANT,
  PRODUCTION,
  STAGING,
  STUDY,
} from '../constants/UrlConstants';

declare var __ENV_DEV__ :boolean; // injected by Webpack.DefinePlugin

const LOG = new Logger('AppApi');

const getBaseUrl = () => {
  if (__ENV_DEV__) {
    return ENV_URLS.get(LOCAL);
  }
  if (window.location.host.startsWith(STAGING)) {
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
  return `${baseUrl}/${CHRONICLE}/${STUDY}${PARTICIPANT}/${DATA}/${studyId}/${participantEntityKeyId}?${FILE_TYPE}=csv`;
};

export { getBaseUrl, getParticipantsDataUrl };
