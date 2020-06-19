// @flow

import { get } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { v4 as uuid } from 'uuid';

import { ASSOCIATION_ENTITY_SET_NAMES, ENTITY_SET_NAMES } from '../../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { PART_OF_ES_NAME } = ASSOCIATION_ENTITY_SET_NAMES;
const { QUESTIONS_ES_NAME, QUESTIONNAIRE_ES_NAME, CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const {
  ID_FQN,
  TITLE_FQN,
  VALUES_FQN,
  COMPLETED_DATE_TIME_FQN
} = PROPERTY_TYPE_FQNS;

const { getPageSectionKey, getEntityAddressKey } = DataProcessingUtils;

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

// return an array of question entities
const createQuestionEntitiesFromFormData = (formData :Object) => {
  const psk = getPageSectionKey(2, 1);
  const questions :Object[] = get(formData, psk);

  const titleEAK = getEntityAddressKey(0, QUESTIONS_ES_NAME, TITLE_FQN);
  const valuesEAK = getEntityAddressKey(0, QUESTIONS_ES_NAME, VALUES_FQN);

  // $FlowFixMe
  return questions.map((question, index) => {
    const newTitleEAK = getEntityAddressKey(index, QUESTIONS_ES_NAME, TITLE_FQN);
    const newValuesEAK = getEntityAddressKey(index, QUESTIONS_ES_NAME, VALUES_FQN);
    return {
      [newTitleEAK]: get(question, titleEAK),
      [newValuesEAK]: get(question, valuesEAK, []).map((values) => get(values, 'choice'))
    };
  });
};

export {
  createQuestionnaireAssociations,
  createQuestionEntitiesFromFormData,
};
