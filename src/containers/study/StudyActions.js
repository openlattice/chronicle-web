/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CREATE_STUDY :'CREATE_STUDY' = 'CREATE_STUDY';
const createStudy :RequestSequence = newRequestSequence(CREATE_STUDY);

const GET_STUDY_DETAILS :'GET_STUDY_DETAILS' = 'GET_STUDY_DETAILS';
const getStudyDetails :RequestSequence = newRequestSequence(GET_STUDY_DETAILS);

const ADD_PARTICIPANT :'ADD_PARTICIPANT' = 'ADD_PARTICIPANT';
const addStudyParticipant :RequestSequence = newRequestSequence(ADD_PARTICIPANT);

const CREATE_PARTICIPANTS_ENTITY_SET :'CREATE_PARTICIPANTS_ENTITY_SET' = 'CREATE_PARTICIPANTS_ENTITY_SET';
const createParticipantEntitySet :RequestSequence = newRequestSequence(CREATE_PARTICIPANTS_ENTITY_SET);

export {
  ADD_PARTICIPANT,
  CREATE_PARTICIPANTS_ENTITY_SET,
  CREATE_STUDY,
  GET_STUDY_DETAILS,
  addStudyParticipant,
  createParticipantEntitySet,
  createStudy,
  getStudyDetails
};
