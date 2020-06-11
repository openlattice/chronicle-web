// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { ENTITY_SET_NAMES } from '../../../core/edm/constants/EntitySetNames';

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

const aboutSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 1)]: {
      type: 'object',
      title: 'About',
      properties: {
        [getEntityAddressKey(0, QUESTIONNAIRE_ES_NAME, NAME_FQN)]: {
          type: 'string',
          title: 'Questionnaire Title',
        },
        [getEntityAddressKey(0, QUESTIONNAIRE_ES_NAME, DESCRIPTION_FQN)]: {
          type: 'string',
          title: 'Description'
        }
      },
      required: [
        getEntityAddressKey(0, QUESTIONNAIRE_ES_NAME, DESCRIPTION_FQN),
        getEntityAddressKey(0, QUESTIONNAIRE_ES_NAME, NAME_FQN)
      ]
    }
  }
};

const aboutUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, QUESTIONNAIRE_ES_NAME, NAME_FQN)]: {
      classNames: 'column-span-12'
    },
    [getEntityAddressKey(0, QUESTIONNAIRE_ES_NAME, DESCRIPTION_FQN)]: {
      classNames: 'column-span-12',
      'ui:widget': 'textarea'
    }
  }
};

const questionsSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 2)]: {
      type: 'array',
      title: 'Questions',
      items: {
        type: 'object',
        properties: {
          [getEntityAddressKey(0, QUESTIONS_ES_NAME, TITLE_FQN)]: {
            title: 'Question',
            type: 'string'
          },
          [getEntityAddressKey(0, ANSWERS_ES_NAME, VALUES_FQN)]: {
            title: 'Comma-separated answer choices',
            type: 'string'
          }
        },
        required: [
          getEntityAddressKey(0, QUESTIONS_ES_NAME, TITLE_FQN)
        ]
      },
      default: [{}]
    }
  }
};

const questionsUiSchema = {
  [getPageSectionKey(1, 2)]: {
    classNames: 'column-span-12',
    items: {
      classNames: 'grid-container',
      [getEntityAddressKey(0, QUESTIONS_ES_NAME, TITLE_FQN)]: {
        classNames: 'column-span-6'
      },
      [getEntityAddressKey(0, ANSWERS_ES_NAME, VALUES_FQN)]: {
        classNames: 'column-span-6'
      }
    },
  }
};

const SCHEMAS = {
  aboutSchema,
  questionsSchema
};

const UI_SCHEMAS = {
  aboutUiSchema,
  questionsUiSchema
};

export {
  SCHEMAS,
  UI_SCHEMAS
};
