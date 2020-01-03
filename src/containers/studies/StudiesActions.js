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

const GET_PARTICIPANTS_ENROLLMENT :'GET_PARTICIPANTS_ENROLLMENT' = 'GET_PARTICIPANTS_ENROLLMENT';
const getParticipantsEnrollmentStatus :RequestSequence = newRequestSequence(GET_PARTICIPANTS_ENROLLMENT);

const GET_STUDIES :'GET_STUDIES' = 'GET_STUDIES';
const getStudies :RequestSequence = newRequestSequence(GET_STUDIES);

const GET_STUDY_PARTICIPANTS :'GET_STUDY_PARTICIPANTS' = 'GET_STUDY_PARTICIPANTS';
const getStudyParticipants :RequestSequence = newRequestSequence(GET_STUDY_PARTICIPANTS);

export {
  ADD_PARTICIPANT,
  CREATE_PARTICIPANTS_ENTITY_SET,
  CREATE_STUDY,
  GET_PARTICIPANTS_ENROLLMENT,
  GET_STUDIES,
  GET_STUDY_PARTICIPANTS,
  addStudyParticipant,
  createParticipantsEntitySet,
  createStudy,
  getParticipantsEnrollmentStatus,
  getStudies,
  getStudyParticipants,
};
