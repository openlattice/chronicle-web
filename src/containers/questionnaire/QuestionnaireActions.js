// @flow

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CHANGE_ACTIVE_STATUS :'CHANGE_ACTIVE_STATUS' = 'CHANGE_ACTIVE_STATUS';
const changeActiveStatus :RequestSequence = newRequestSequence(CHANGE_ACTIVE_STATUS);

const CREATE_QUESTIONNAIRE :'CREATE_QUESTIONNAIRE' = 'CREATE_QUESTIONNAIRE';
const createQuestionnaire :RequestSequence = newRequestSequence(CREATE_QUESTIONNAIRE);

const DELETE_QUESTIONNAIRE :'DELETE_QUESTIONNAIRE' = 'DELETE_QUESTIONNAIRE';
const deleteQuestionnaire :RequestSequence = newRequestSequence(DELETE_QUESTIONNAIRE);

const DOWNLOAD_QUESTIONNAIRE_RESPONSES :'DOWNLOAD_QUESTIONNAIRE_RESPONSES' = 'DOWNLOAD_QUESTIONNAIRE_RESPONSES';
const downloadQuestionnaireResponses :RequestSequence = newRequestSequence(DOWNLOAD_QUESTIONNAIRE_RESPONSES);

const GET_QUESTIONNAIRE :'GET_QUESTIONNAIRE' = 'GET_QUESTIONNAIRE';
const getQuestionnaire :RequestSequence = newRequestSequence(GET_QUESTIONNAIRE);

const GET_QUESTIONNAIRE_RESPONSES :'GET_QUESTIONNAIRE_RESPONSES' = 'GET_QUESTIONNAIRE_RESPONSES';
const getQuestionnaireResponses :RequestSequence = newRequestSequence(GET_QUESTIONNAIRE_RESPONSES);

const GET_STUDY_QUESTIONNAIRES :'GET_STUDY_QUESTIONNAIRES' = 'GET_STUDY_QUESTIONNAIRES';
const getStudyQuestionnaires :RequestSequence = newRequestSequence(GET_STUDY_QUESTIONNAIRES);

const SUBMIT_QUESTIONNAIRE :'SUBMIT_QUESTIONNAIRE' = 'SUBMIT_QUESTIONNAIRE';
const submitQuestionnaire :RequestSequence = newRequestSequence(SUBMIT_QUESTIONNAIRE);

export {
  CHANGE_ACTIVE_STATUS,
  CREATE_QUESTIONNAIRE,
  DELETE_QUESTIONNAIRE,
  DOWNLOAD_QUESTIONNAIRE_RESPONSES,
  GET_QUESTIONNAIRE,
  GET_QUESTIONNAIRE_RESPONSES,
  GET_STUDY_QUESTIONNAIRES,
  SUBMIT_QUESTIONNAIRE,
  changeActiveStatus,
  createQuestionnaire,
  deleteQuestionnaire,
  downloadQuestionnaireResponses,
  getQuestionnaire,
  getQuestionnaireResponses,
  getStudyQuestionnaires,
  submitQuestionnaire,
};
