// @flow

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_CHRONICLE_APPS_DATA :'GET_CHRONICLE_APPS_DATA' = 'GET_CHRONICLE_APPS_DATA';
const getChronicleAppsData :RequestSequence = newRequestSequence(GET_CHRONICLE_APPS_DATA);

const SUBMIT_SURVEY :'SUBMIT_SURVEY' = 'SUBMIT_SURVEY';
const submitSurvey :RequestSequence = newRequestSequence(SUBMIT_SURVEY);

const UPDATE_APP_USER_TYPE :'UPDATE_APP_USER_TYPE' = 'UPDATE_APP_USER_TYPE';
const updateAppUserType = (userType :string, entityId :UUID) => ({
  type: UPDATE_APP_USER_TYPE,
  userType,
  entityId
});

export {
  GET_CHRONICLE_APPS_DATA,
  SUBMIT_SURVEY,
  UPDATE_APP_USER_TYPE,
  getChronicleAppsData,
  submitSurvey,
  updateAppUserType,
};
