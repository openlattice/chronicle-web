// @flow

import type { RequestSequence } from 'redux-reqseq';
import { newRequestSequence } from 'redux-reqseq';

const CREATE_QUESTIONNAIRE :'CREATE_QUESTIONNAIRE' = 'CREATE_QUESTIONNAIRE';
const createQuestionnaire :RequestSequence = newRequestSequence(CREATE_QUESTIONNAIRE);

export {
  CREATE_QUESTIONNAIRE,
  createQuestionnaire
};
