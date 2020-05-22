// @flow

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_QUESTIONNAIRE :'GET_QUESTIONNAIRE' = 'GET_QUESTIONNAIRE';
const getQuestionnaire :RequestSequence = newRequestSequence(GET_QUESTIONNAIRE);

const SUBMIT_QUESTIONNAIRE :'SUBMIT_QUESTIONNAIRE' = 'SUBMIT_QUESTIONNAIRE';
const submitQuestionnaire :RequestSequence = newRequestSequence(SUBMIT_QUESTIONNAIRE);

export {
  GET_QUESTIONNAIRE,
  SUBMIT_QUESTIONNAIRE,
  getQuestionnaire,
  submitQuestionnaire,
};
