// @flow

import type { RequestSequence } from 'redux-reqseq';
import { newRequestSequence } from 'redux-reqseq';

const GET_CHRONICLE_USER_APPS :'GET_CHRONICLE_USER_APPS' = 'GET_CHRONICLE_USER_APPS';
const getChronicleUserApps :RequestSequence = newRequestSequence(GET_CHRONICLE_USER_APPS);

export {
  GET_CHRONICLE_USER_APPS,
  getChronicleUserApps
};
