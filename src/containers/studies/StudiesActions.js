/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_PARTICIPANT :'ADD_PARTICIPANT' = 'ADD_PARTICIPANT';
const addStudyParticipant :RequestSequence = newRequestSequence(ADD_PARTICIPANT);

const CREATE_PARTICIPANTS_ENTITY_SET :'CREATE_PARTICIPANTS_ENTITY_SET' = 'CREATE_PARTICIPANTS_ENTITY_SET';
const createParticipantsEntitySet :RequestSequence = newRequestSequence(CREATE_PARTICIPANTS_ENTITY_SET);

const CREATE_STUDY :'CREATE_STUDY' = 'CREATE_STUDY';
const createStudy :RequestSequence = newRequestSequence(CREATE_STUDY);

const EDIT_STUDY :'EDIT_STUDY' = 'EDIT_STUDY';
const editStudy :RequestSequence = newRequestSequence(EDIT_STUDY);

const GET_STUDIES :'GET_STUDIES' = 'GET_STUDIES';
const getStudies :RequestSequence = newRequestSequence(GET_STUDIES);

export {
  ADD_PARTICIPANT,
  CREATE_PARTICIPANTS_ENTITY_SET,
  CREATE_STUDY,
  EDIT_STUDY,
  GET_STUDIES,
  addStudyParticipant,
  createParticipantsEntitySet,
  createStudy,
  editStudy,
  getStudies,
};
