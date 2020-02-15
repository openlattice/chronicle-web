/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const ADD_PARTICIPANT :'ADD_PARTICIPANT' = 'ADD_PARTICIPANT';
const addStudyParticipant :RequestSequence = newRequestSequence(ADD_PARTICIPANT);

const CHANGE_ENROLLMENT_STATUS :'CHANGE_ENROLLMENT_STATUS' = 'CHANGE_ENROLLMENT_STATUS';
const changeEnrollmentStatus :RequestSequence = newRequestSequence(CHANGE_ENROLLMENT_STATUS);

const CREATE_PARTICIPANTS_ENTITY_SET :'CREATE_PARTICIPANTS_ENTITY_SET' = 'CREATE_PARTICIPANTS_ENTITY_SET';
const createParticipantsEntitySet :RequestSequence = newRequestSequence(CREATE_PARTICIPANTS_ENTITY_SET);

const CREATE_STUDY :'CREATE_STUDY' = 'CREATE_STUDY';
const createStudy :RequestSequence = newRequestSequence(CREATE_STUDY);

const DELETE_STUDY_PARTICIPANT :'DELETE_STUDY_PARTICIPANT' = 'DELETE_STUDY_PARTICIPANT';
const deleteStudyParticipant :RequestSequence = newRequestSequence(DELETE_STUDY_PARTICIPANT);

const GET_PARTICIPANTS_ENROLLMENT :'GET_PARTICIPANTS_ENROLLMENT' = 'GET_PARTICIPANTS_ENROLLMENT';
const getParticipantsEnrollmentStatus :RequestSequence = newRequestSequence(GET_PARTICIPANTS_ENROLLMENT);

const GET_STUDIES :'GET_STUDIES' = 'GET_STUDIES';
const getStudies :RequestSequence = newRequestSequence(GET_STUDIES);

const GET_STUDY_PARTICIPANTS :'GET_STUDY_PARTICIPANTS' = 'GET_STUDY_PARTICIPANTS';
const getStudyParticipants :RequestSequence = newRequestSequence(GET_STUDY_PARTICIPANTS);

const GET_STUDY_AUTHORIZATIONS :'GET_STUDY_AUTHORIZATIONS' = 'GET_STUDY_AUTHORIZATIONS';
const getStudyAuthorizations :RequestSequence = newRequestSequence(GET_STUDY_AUTHORIZATIONS);

const UPDATE_PARTICIPANTS_ENTITY_PERMISSIONS
  :'UPDATE_PARTICIPANTS_ENTITY_PERMISSIONS' = 'UPDATE_PARTICIPANTS_ENTITY_PERMISSIONS';
const updateParticipantsEntitySetPermissions
  :RequestSequence = newRequestSequence(UPDATE_PARTICIPANTS_ENTITY_PERMISSIONS);

const UPDATE_STUDY :'UPDATE_STUDY' = 'UPDATE_STUDY';
const updateStudy :RequestSequence = newRequestSequence(UPDATE_STUDY);

export {
  ADD_PARTICIPANT,
  CHANGE_ENROLLMENT_STATUS,
  CREATE_PARTICIPANTS_ENTITY_SET,
  CREATE_STUDY,
  DELETE_STUDY_PARTICIPANT,
  GET_PARTICIPANTS_ENROLLMENT,
  GET_STUDIES,
  GET_STUDY_PARTICIPANTS,
  GET_STUDY_AUTHORIZATIONS,
  UPDATE_PARTICIPANTS_ENTITY_PERMISSIONS,
  UPDATE_STUDY,
  addStudyParticipant,
  changeEnrollmentStatus,
  createParticipantsEntitySet,
  createStudy,
  deleteStudyParticipant,
  getParticipantsEnrollmentStatus,
  getStudies,
  getStudyParticipants,
  getStudyAuthorizations,
  updateParticipantsEntitySetPermissions,
  updateStudy
};
