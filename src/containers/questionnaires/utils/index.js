// @flow

import {
  get,
  getIn,
  List,
  Map,
  fromJS
} from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { RRule, RRuleSet } from 'rrule';
import { Constants } from 'lattice';
import invert from 'lodash/invert';
import { v4 as uuid } from 'uuid';

import { ENTITY_SET_NAMES } from '../../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { QUESTIONNAIRE_SUMMARY, DAYS_OF_WEEK } from '../constants/constants';

const { OPENLATTICE_ID_FQN } = Constants;

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

  psk = getPageSectionKey(2, 1);
  const questions :Object[] = get(formData, psk);
  const singleAnswerQuestions = questions.filter((question) => Object.keys(question).length === 1);

  result[NUM_SINGLE_ANSWER] = singleAnswerQuestions.length;
  result[NUM_MULTIPLE_CHOICE] = questions.length - singleAnswerQuestions.length;

  return result;
};

// return [hour, minute] from a 24 hour formated time string
// input example: '21:00', '09:00'
const parseTimeStr = (time :string) => {
  const tokens = time.split(':');
  return tokens.map((token) => parseInt(token, 10));
};

// return an array of RRule.MO, RRule.TU etc from ['Monday', 'Tuesday'] etc
const getRRuleWeekDayConstants = (daysOfWeek :string[]) => {
  const mapper = invert(DAYS_OF_WEEK); // {'Monday': 'MO', 'Tuesday': 'TU'}
  return daysOfWeek.map((day) => RRule[get(mapper, day)]);
};

// generate recurrence rules as defined in https://tools.ietf.org/html/rfc5545
const createRecurrenceRuleSetFromFormData = (formData :Object) => {
  const psk = getPageSectionKey(3, 1);

  const daysOfWeek :string[] = getIn(formData, [psk, 'daysOfWeek']);
  const daysOfWeekConsts = getRRuleWeekDayConstants(daysOfWeek);

  const selectedTimes :string[] = getIn(formData, [psk, 'time'])
    .map((time :Object) => get(time, 'time')); // TODO time const

  const rruleSet = new RRuleSet();

  // add rules to rruleset
  selectedTimes.forEach((time) => {
    const [hour, minute] = parseTimeStr(time);

    rruleSet.rrule(new RRule({
      freq: RRule.WEEKLY,
      byweekday: daysOfWeekConsts,
      byhour: hour,
      byminute: minute
    }));
  });
  return rruleSet.toString();
};

const createPreviewQuestionEntities = (formData :Object) => {

  const psk = getPageSectionKey(2, 1);
  const questions :Object[] = get(formData, psk);

  const valuesEAK = getEntityAddressKey(0, QUESTIONS_ES_NAME, VALUES_FQN);
  const titleEAK = getEntityAddressKey(0, QUESTIONS_ES_NAME, TITLE_FQN);

  const questionEntities = List().withMutations((list) => {
    questions.forEach((question) => {
      const questionEntity = fromJS({
        [OPENLATTICE_ID_FQN]: [uuid()],
        [TITLE_FQN.toString()]: [get(question, titleEAK)],
        [VALUES_FQN.toString()]: get(question, valuesEAK, []).map((answer) => get(answer, 'choice'))
      });

      list.push(questionEntity);
    });
  });

  return questionEntities;
};

export {
  createPreviewQuestionEntities,
  createRecurrenceRuleSetFromFormData,
  getQuestionnaireSummaryFromForm
};
