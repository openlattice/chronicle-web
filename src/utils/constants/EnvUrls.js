// @flow

import { Map, fromJS } from 'immutable';

import EnvTypes from './EnvTypes';

const { LOCAL, PRODUCTION, STAGING } = EnvTypes;

const ENV_URLS :Map<string, string> = fromJS({
  [LOCAL]: 'http://localhost:8081',
  [PRODUCTION]: 'https://api.openlattice.com',
  [STAGING]: 'https://api.staging.openlattice.com'
});

export default ENV_URLS;
