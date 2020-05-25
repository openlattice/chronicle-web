// @flow

import {
  List,
  Map,
  getIn,
  setIn
} from 'immutable';
import { Constants } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';

import { ENTITY_SET_NAMES } from '../../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const {
  getEntityAddressKey,
  getPageSectionKey,
  parseEntityAddressKey
} = DataProcessingUtils;

const { OPENLATTICE_ID_FQN } = Constants;
const { TITLE, VALUES_FQN } = PROPERTY_TYPE_FQNS;
const { QUESTIONS_ES_NAME } = ENTITY_SET_NAMES;


const getSchemaProperties = (questions :List) => {

  const properties = Map().withMutations((mutator) => {
    questions.forEach((question) => {
      const entityKeyId = question.getIn([OPENLATTICE_ID_FQN, 0]);
      const addressKey = getEntityAddressKey(entityKeyId, QUESTIONS_ES_NAME, VALUES_FQN);

      mutator
        .setIn([addressKey, 'title'], question.getIn([TITLE, 0]))
        .setIn([addressKey, 'type'], 'string');

      const answerChoices = question.get(VALUES_FQN, List());
      if (!answerChoices.isEmpty()) {
        mutator.setIn([addressKey, 'enum'], answerChoices.map((choice) => String(choice)));
      }
    });
  });

  return properties.toJS();
};

const getUiSchemaOptions = (schemaProperties :Object) => {
  const result = Map().withMutations((mutator) => {
    Object.keys(schemaProperties).forEach((property) => {
      mutator.setIn([property, 'classNames'], 'column-span-12');

      if (getIn(schemaProperties, [property, 'enum'])) {
        mutator
          .setIn([property, 'ui:widget'], 'radio')
          .setIn([property, 'ui:options', 'row'], true)
          .setIn([property, 'ui:options', 'mode'], 'button');
      }
    });
  });

  return result.toJS();
};

const getQuestionAnswerMapping = (formData :Object) => {
  let result = {};
  Object.values(formData).forEach((addressKeys :Object) => {
    Object.entries(addressKeys).forEach(([key, value]) => {
      const { entityKeyId } = parseEntityAddressKey(key);
      result = setIn(result, [entityKeyId, VALUES_FQN], [value]);
    });
  });
  return result;
};

const createInitialFormData = (answersById :Map, answerQuestionIdMap :Map, questions :List, answers :Map = Map()) => {
  // create data to populate form
  const pageSection = getPageSectionKey(1, 1);
  const result = Map().withMutations((mutator) => {
    //
    answers.forEach((answer, answerId) => {
      const questionId = answerQuestionIdMap.get(answerId);
      const addressKey = getEntityAddressKey(questionId, QUESTIONS_ES_NAME, VALUES_FQN);

      const value = answersById.get(answerId).getIn([VALUES_FQN, 0]);
      mutator.setIn([pageSection, addressKey], value);
    });
  });

  return result.toJS();
};

const getCsvFileName = (questionnaireName :string, participantId :UUID) => {
  return `${questionnaireName}_${participantId}.csv`;
};

export {
  createInitialFormData,
  getCsvFileName,
  getQuestionAnswerMapping,
  getSchemaProperties,
  getUiSchemaOptions
};
