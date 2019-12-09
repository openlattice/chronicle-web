/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_STUDIES :'GET_STUDIES' = 'GET_STUDIES';
const getStudies :RequestSequence = newRequestSequence(GET_STUDIES);

export {
  GET_STUDIES,
  getStudies
};
