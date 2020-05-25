// @flow

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

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
  DOWNLOAD_QUESTIONNAIRE_RESPONSES,
  GET_QUESTIONNAIRE,
  GET_QUESTIONNAIRE_RESPONSES,
  GET_STUDY_QUESTIONNAIRES,
  SUBMIT_QUESTIONNAIRE,
  downloadQuestionnaireResponses,
  getQuestionnaire,
  getQuestionnaireResponses,
  getStudyQuestionnaires,
  submitQuestionnaire,
};
