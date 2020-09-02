// @flow

import {
  List,
  Map,
  getIn,
  setIn
} from 'immutable';
import { Constants } from 'lattice';
import { DataProcessingUtils } from 'lattice-fabricate';

import { QUESTION } from '../../../core/edm/constants/CollectionTemplateNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const {
  getEntityAddressKey,
  getPageSectionKey,
  parseEntityAddressKey
} = DataProcessingUtils;

const { OPENLATTICE_ID_FQN } = Constants;
const { TITLE_FQN, VALUES_FQN } = PROPERTY_TYPE_FQNS;

const getSchemaProperties = (questions :List) => {
  let properties = {};

  questions.forEach((question) => {
    const entityKeyId = question.getIn([OPENLATTICE_ID_FQN, 0]);
    const addressKey = getEntityAddressKey(entityKeyId, QUESTION, VALUES_FQN);

    properties = setIn(properties, [addressKey, 'title'], question.getIn([TITLE_FQN, 0]));
    properties = setIn(properties, [addressKey, 'type'], 'string');

    const answerChoices = question.get(VALUES_FQN, List()).toJS();
    if (answerChoices.length !== 0) {
      properties = setIn(properties, [addressKey, 'enum'], answerChoices.map((choice) => String(choice)));
    }
  });

  return properties;
};

const getUiSchemaOptions = (schemaProperties :Object) => {
  let result = {};

  Object.keys(schemaProperties).forEach((property) => {
    result = setIn(result, [property, 'classNames'], 'column-span-12');

    if (getIn(schemaProperties, [property, 'enum'])) {
      result = setIn(result, [property, 'ui:widget'], 'radio');
      result = setIn(result, [property, 'ui:options', 'row'], true);
      result = setIn(result, [property, 'ui:options', 'mode'], 'button');
    }
  });

  return result;
};

// create a mapping from questionId -> ol.values value
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

// create data to prefill the form
const createInitialFormData = (answersById :Map, answerQuestionIdMap :Map, questions :List, answers :Map = Map()) => {
  const pageSection = getPageSectionKey(1, 1);
  let result = {};

  answers.forEach((answer, answerId) => {
    const questionId = answerQuestionIdMap.get(answerId);
    const addressKey = getEntityAddressKey(questionId, QUESTION, VALUES_FQN);

    const value = answersById.get(answerId).getIn([VALUES_FQN, 0]);
    result = setIn(result, [pageSection, addressKey], value);
  });

  return result;
};

const getCsvFileName = (questionnaireName :string, participantId :UUID) => `${questionnaireName}_${participantId}.csv`;

const createSchema = (schemaProperties :Object, uiSchemaOptions :Object) => {
  const schema = {
    title: '',
    type: 'object',
    properties: {
      [getPageSectionKey(1, 1)]: {
        title: '',
        type: 'object',
        properties: {
          ...schemaProperties
        },
        required: Object.keys(schemaProperties)
      }
    }
  };

  const uiSchema = {
    [getPageSectionKey(1, 1)]: {
      classNames: 'column-span-12 grid-container',
      ...uiSchemaOptions
    }
  };

  return { schema, uiSchema };
};

export {
  createInitialFormData,
  createSchema,
  getCsvFileName,
  getQuestionAnswerMapping,
  getSchemaProperties,
  getUiSchemaOptions
};
