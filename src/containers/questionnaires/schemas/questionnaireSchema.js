// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { ENTITY_SET_NAMES } from '../../../core/edm/constants/EntitySetNames';
import { DAYS_OF_WEEK } from '../constants/constants';

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
            title: '',
            type: 'array',
            items: {
              type: 'object',
              title: '',
              properties: {
                choice: {
                  type: 'string',
                  title: 'Answer choice'
                },
              },
              required: ['choice']
            },
            uniqueItems: true
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
    'ui:options': {
      addButtonText: '+ Add Question'
    },
    items: {
      classNames: 'grid-container',
      [getEntityAddressKey(0, QUESTIONS_ES_NAME, TITLE_FQN)]: {
        classNames: 'column-span-6'
      },
      [getEntityAddressKey(0, ANSWERS_ES_NAME, VALUES_FQN)]: {
        classNames: 'column-span-6',
        'ui:options': {
          addButtonText: '+ Add Choice'
        },
        items: {
          classNames: 'grid-container',
          choice: {
            classNames: 'column-span-12'
          }
        }
      }
    },
  }
};

const schedulerSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 3)]: {
      type: 'object',
      title: 'Notification trigger settings',
      properties: {
        daysOfWeek: {
          title: 'Days of week to send notification',
          type: 'array',
          items: {
            type: 'string',
            enum: Object.values(DAYS_OF_WEEK)
          },
          minItems: 1,
          uniqueItems: true
        },
        time: {
          type: 'array',
          title: '',
          items: {
            type: 'object',
            properties: {
              time: {
                type: 'string',
                title: 'Notification time'
              }
            },
            required: ['time']
          },
          minItems: 1,
          uniqueItems: true
        }
      },
      required: ['daysOfWeek', 'time']
    }
  }
};

const schedulerUiSchema = {
  [getPageSectionKey(1, 3)]: {
    classNames: 'column-span-12 grid-container',
    daysOfWeek: {
      classNames: 'column-span-12',
      'ui:widget': 'checkboxes',
      'ui:options': {
        mode: 'button',
        row: true
      }
    },
    time: {
      classNames: 'column-span-12',
      'ui:options': {
        showIndex: false,
        addButtonText: '+ Add Time',
      },
      items: {
        classNames: 'grid-container',
        time: {
          classNames: 'column-span-12',
          'ui:widget': 'TimeWidget',
          'ui:options': {
            format: 'H:mm',
            showIndex: false,
            addButtonText: '+ Add Time',
            mask: '__:__',
          },
        }
      }
    }
  }
};

const SCHEMAS = {
  aboutSchema,
  questionsSchema,
  schedulerSchema
};

const UI_SCHEMAS = {
  aboutUiSchema,
  questionsUiSchema,
  schedulerUiSchema
};

export {
  SCHEMAS,
  UI_SCHEMAS
};
