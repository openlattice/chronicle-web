// @flow

import { get, getIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';

import { ENTITY_SET_NAMES } from '../../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { QUESTIONNAIRE_SUMMARY } from '../constants/constants';

const {
  TITLE,
  DESCRIPTION,
  NUM_MULTIPLE_CHOICE,
  NUM_SINGLE_ANSWER
} = QUESTIONNAIRE_SUMMARY;

const {
  ANSWERS_ES_NAME,
  QUESTIONNAIRE_ES_NAME,
  QUESTIONS_ES_NAME
} = ENTITY_SET_NAMES;

const {
  DESCRIPTION_FQN,
  NAME_FQN,
  TITLE_FQN,
  VALUES_FQN
} = PROPERTY_TYPE_FQNS;

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;


// return an Object with title, description, numMultipleChoice and numSingleAnswer questions
const getQuestionnaireSummaryFromForm = (formData :Object = {}) => {
  const result = {};

  let psk = getPageSectionKey(1, 1);
  let eak = getEntityAddressKey(0, QUESTIONNAIRE_ES_NAME, NAME_FQN);
  result[TITLE] = getIn(formData, [psk, eak]);

  eak = getEntityAddressKey(0, QUESTIONNAIRE_ES_NAME, DESCRIPTION_FQN);
  result[DESCRIPTION] = getIn(formData, [psk, eak]);

  psk = getPageSectionKey(1, 2);
  const questions :Object[] = get(formData, psk);
  const singleAnswerQuestions = questions.filter((question) => Object.keys(question).length === 1);

  result[NUM_SINGLE_ANSWER] = singleAnswerQuestions.length;
  result[NUM_MULTIPLE_CHOICE] = questions.length - singleAnswerQuestions.length;

  return result;
};

export {
  getQuestionnaireSummaryFromForm
};
