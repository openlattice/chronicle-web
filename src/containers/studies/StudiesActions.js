/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_STUDIES :'GET_STUDIES' = 'GET_STUDIES';
const getStudies :RequestSequence = newRequestSequence(GET_STUDIES);

const CREATE_STUDY :'CREATE_STUDY' = 'CREATE_STUDY';
const createStudy :RequestSequence = newRequestSequence(CREATE_STUDY);

const GET_STUDY_DETAILS :'GET_STUDY_DETAILS' = 'GET_STUDY_DETAILS';
const getStudyDetails :RequestSequence = newRequestSequence(GET_STUDY_DETAILS);

export {
  CREATE_STUDY,
  GET_STUDIES,
  GET_STUDY_DETAILS,
  createStudy,
  getStudies,
  getStudyDetails
};
