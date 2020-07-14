// @flow

import {
  List,
  Map,
  fromJS,
  get,
  getIn,
  setIn
} from 'immutable';
import { Constants } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';
import { LangUtils } from 'lattice-utils';
import { DateTime, Info } from 'luxon';
import { RRule, RRuleSet } from 'rrule';
import { v4 as uuid } from 'uuid';

import QuestionTypes from '../constants/questionTypes';
import { ASSOCIATION_ENTITY_SET_NAMES, ENTITY_SET_NAMES } from '../../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { QUESTIONNAIRE_SUMMARY } from '../constants/constants';

const { isNonEmptyString } = LangUtils;
const { getEntityAddressKey, getPageSectionKey, processEntityData } = DataProcessingUtils;

const { TEXT_ENTRY } = QuestionTypes;
const { OPENLATTICE_ID_FQN } = Constants;
const { PART_OF_ES_NAME } = ASSOCIATION_ENTITY_SET_NAMES;

const {
  DESCRIPTION,
  NUM_MULTIPLE_CHOICE,
  NUM_SINGLE_ANSWER,
  TITLE
} = QUESTIONNAIRE_SUMMARY;

const {
  CHRONICLE_STUDIES,
  QUESTIONNAIRE_ES_NAME,
  QUESTIONS_ES_NAME
} = ENTITY_SET_NAMES;

const {
  COMPLETED_DATE_TIME_FQN,
  DESCRIPTION_FQN,
  ID_FQN,
  NAME_FQN,
  TITLE_FQN,
  VALUES_FQN
} = PROPERTY_TYPE_FQNS;

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
  const singleAnswerQuestions = questions.filter((question) => question.questionType === TEXT_ENTRY);

  result[NUM_SINGLE_ANSWER] = singleAnswerQuestions.length;
  result[NUM_MULTIPLE_CHOICE] = questions.length - singleAnswerQuestions.length;

  return result;
};

// generate recurrence rules as defined in https://tools.ietf.org/html/rfc5545
const createRecurrenceRuleSetFromFormData = (formData :Object) => {
  const psk = getPageSectionKey(3, 1);

  const rruleWeekDayConsts = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];
  // $FlowFixMe
  const mapper = Info.weekdays().reduce((result, day, index) => ({
    ...result,
    [day]: rruleWeekDayConsts[index]
  }), {});

  const daysOfWeek :string[] = getIn(formData, [psk, 'daysOfWeek']);
  const rruleWeekDays = daysOfWeek.map((day) => mapper[day]);

  const selectedTimes :string[] = getIn(formData, [psk, 'time'])
    .map((time :Object) => get(time, 'time')); // TODO time const

  const rruleSet = new RRuleSet();

  // add rules to rruleset
  selectedTimes.forEach((time) => {
    const dateTime = DateTime.fromISO(time);

    rruleSet.rrule(new RRule({
      freq: RRule.WEEKLY,
      byweekday: rruleWeekDays,
      byhour: dateTime.hour,
      byminute: dateTime.minute
    }));
  });
  return rruleSet.toString();
};

// parse a rruleSet string and get days of week + times
const getWeekDaysAndTimesFromRruleSet = (rruleSet :string) => {
  const rrules :string[] = rruleSet.split('RRULE:').filter((token) => isNonEmptyString(token));
  // get week days
  // the days of the week are the same in all the individual rules in the rrruleSet,
  // so we only need to read the values from the first rrule
  // $FlowFixMe
  const weekdays = Info.weekdays();
  const weekDays = RRule.parseString(rrules[0]).byweekday
    .map((day) => day.weekday)
    .sort()
    .map((index) => weekdays[index]);

  // $FlowFixMe
  const times = rrules
    .map((rrule) => RRule.parseString(rrule))
    .map((options) => DateTime.fromObject({ hour: options.byhour, minute: options.byminute }))
    .map((date) => date.toLocaleString(DateTime.TIME_SIMPLE))
    .sort();

  return [weekDays, times];
};

const createPreviewQuestionEntities = (formData :Object) => {

  const psk = getPageSectionKey(2, 1);
  const questions :Object[] = get(formData, psk);

  const valuesEAK = getEntityAddressKey(-1, QUESTIONS_ES_NAME, VALUES_FQN);
  const titleEAK = getEntityAddressKey(-1, QUESTIONS_ES_NAME, TITLE_FQN);

  const questionEntities = List().withMutations((list) => {
    questions.forEach((question) => {
      const questionEntity = fromJS({
        [OPENLATTICE_ID_FQN]: [uuid()],
        [TITLE_FQN.toString()]: [get(question, titleEAK)],
        [VALUES_FQN.toString()]: get(question, valuesEAK, [])
      });

      list.push(questionEntity);
    });
  });

  return questionEntities;
};

// return a array of:
// 1) question -> partof -> questionnaire associations
// 2) questionnaire -> partof -> study association
const createQuestionnaireAssociations = (formData :Object[], studyEKID :UUID) => {
  const psk = getPageSectionKey(2, 1);
  const questions :Object[] = get(formData, psk);

  const associations = questions.map((question :Object, index :number) => [
    PART_OF_ES_NAME, index, QUESTIONS_ES_NAME, 0, QUESTIONNAIRE_ES_NAME, {
      [ID_FQN.toString()]: [uuid()]
    }
  ]);

  // $FlowFixMe
  return associations.concat(
    [[PART_OF_ES_NAME, 0, QUESTIONNAIRE_ES_NAME, studyEKID, CHRONICLE_STUDIES, {
      [COMPLETED_DATE_TIME_FQN.toString()]: [new Date()]
    }]]
  );
};

const constructEntitiesFromFormData = (
  formData :Object, entityKeyIds :Object, entitySetIds :Map, propertyTypeIds :Map
) => {
  const questionnaireESID = entitySetIds.get(QUESTIONNAIRE_ES_NAME);
  const questionsESID = entitySetIds.get(QUESTIONS_ES_NAME);

  const questionnaireEKID = getIn(entityKeyIds, [questionnaireESID, 0]);
  const questionEKIDS = get(entityKeyIds, questionsESID);

  // update form data
  let updatedFormData = setIn(
    formData,
    [getPageSectionKey(1, 1), getEntityAddressKey(0, QUESTIONNAIRE_ES_NAME, OPENLATTICE_ID_FQN)],
    questionnaireEKID
  );

  questionEKIDS.forEach((questionEKID, index) => {
    updatedFormData = setIn(
      updatedFormData,
      [getPageSectionKey(2, 1), index, getEntityAddressKey(-1, QUESTIONS_ES_NAME, OPENLATTICE_ID_FQN)],
      questionEKID
    );
  });

  let result = processEntityData(
    updatedFormData,
    entitySetIds,
    propertyTypeIds.map((id, fqn) => fqn)
  );

  // set id property on questionnaire entity (required by LUK table)
  result = setIn(result, [questionnaireESID, 0, 'id'], questionnaireEKID);

  const questionEntities = get(result, questionsESID);
  const questionnaireEntity = getIn(result, [questionnaireESID, 0]);

  return { questionEntities, questionnaireEntity };
};

export {
  constructEntitiesFromFormData,
  createPreviewQuestionEntities,
  createQuestionnaireAssociations,
  createRecurrenceRuleSetFromFormData,
  getQuestionnaireSummaryFromForm,
  getWeekDaysAndTimesFromRruleSet,
};
