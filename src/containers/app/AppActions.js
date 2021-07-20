/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_APP_SETTINGS :'GET_APP_SETTINGS' = 'GET_APP_SETTINGS';
const getAppSettings :RequestSequence = newRequestSequence(GET_APP_SETTINGS);

const GET_CONFIGS :'GET_CONFIGS' = 'GET_CONFIGS';
const getConfigs :RequestSequence = newRequestSequence(GET_CONFIGS);

const INITIALIZE_APPLICATION :'INITIALIZE_APPLICATION' = 'INITIALIZE_APPLICATION';
const initializeApplication :RequestSequence = newRequestSequence(INITIALIZE_APPLICATION);

const SWITCH_ORGANIZATION :'SWITCH_ORGANIZATION' = 'SWITCH_ORGANIZATION';
const switchOrganization :RequestSequence = newRequestSequence(SWITCH_ORGANIZATION);

export {
  GET_APP_SETTINGS,
  GET_CONFIGS,
  INITIALIZE_APPLICATION,
  SWITCH_ORGANIZATION,
  getAppSettings,
  getConfigs,
  initializeApplication,
  switchOrganization,
};
