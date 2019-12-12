/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_STUDIES :'GET_STUDIES' = 'GET_STUDIES';
const getStudies :RequestSequence = newRequestSequence(GET_STUDIES);

const CREATE_STUDY :'CREATE_STUDY' = 'CREATE_STUDY';
const createStudy :RequestSequence = newRequestSequence(CREATE_STUDY);

export {
  CREATE_STUDY,
  GET_STUDIES,
  createStudy,
  getStudies,
};
