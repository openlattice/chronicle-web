// @flow

import { Map, fromJS } from 'immutable';

import { LOCAL, PRODUCTION, STAGING } from './UrlConstants';

const ENV_URLS :Map<string, string> = fromJS({
  [LOCAL]: 'http://localhost:8081',
  [PRODUCTION]: 'https://api.openlattice.com',
  [STAGING]: 'https://api.staging.openlattice.com'
});

export default ENV_URLS;
