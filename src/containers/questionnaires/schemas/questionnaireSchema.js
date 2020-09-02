// @flow

import { DataProcessingUtils } from 'lattice-fabricate';
import { Info } from 'luxon';

import QuestionTypes from '../constants/questionTypes';
import { QUESTION, SURVEY } from '../../../core/edm/constants/CollectionTemplateNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { TEXT_ENTRY, MULTIPLE_CHOICE } = QuestionTypes;

const {
  ACTIVE_FQN,
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
        [getEntityAddressKey(0, SURVEY, NAME_FQN)]: {
          type: 'string',
          title: 'Questionnaire Title',
        },
        [getEntityAddressKey(0, SURVEY, DESCRIPTION_FQN)]: {
          type: 'string',
          title: 'Description'
        },
        [getEntityAddressKey(0, SURVEY, ACTIVE_FQN)]: {
          type: 'boolean',
          default: true
        }
      },
      required: [
        getEntityAddressKey(0, SURVEY, DESCRIPTION_FQN),
        getEntityAddressKey(0, SURVEY, NAME_FQN)
      ]
    }
  }
};

const aboutUiSchema = {
  [getPageSectionKey(1, 1)]: {
    classNames: 'column-span-12 grid-container',
    [getEntityAddressKey(0, SURVEY, NAME_FQN)]: {
      classNames: 'column-span-12',
      'ui:autofocus': true
    },
    [getEntityAddressKey(0, SURVEY, DESCRIPTION_FQN)]: {
      classNames: 'column-span-12',
      'ui:widget': 'textarea',
    },
    [getEntityAddressKey(0, SURVEY, ACTIVE_FQN)]: {
      classNames: 'hidden'
    }
  }
};

const questionsSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(2, 1)]: {
      type: 'array',
      title: 'Questions',
      items: {
        type: 'object',
        properties: {
          [getEntityAddressKey(-1, QUESTION, TITLE_FQN)]: {
            title: 'Question',
            type: 'string'
          },
          questionType: {
            type: 'string',
            title: 'Question Type',
            enum: [TEXT_ENTRY, MULTIPLE_CHOICE],
            default: TEXT_ENTRY
          }
        },
        dependencies: {
          questionType: {
            oneOf: [
              {
                properties: {
                  questionType: {
                    enum: [TEXT_ENTRY]
                  }
                }
              },
              {
                properties: {
                  questionType: {
                    enum: [MULTIPLE_CHOICE]
                  },
                  [getEntityAddressKey(-1, QUESTION, VALUES_FQN)]: {
                    type: 'array',
                    title: 'Answer choices',
                    items: {
                      type: 'string',
                      enum: ['']
                    },
                    uniqueItems: true,
                    minItems: 2
                  },
                },
                required: [getEntityAddressKey(-1, QUESTION, VALUES_FQN)]
              }
            ]
          }
        },
        required: [
          getEntityAddressKey(-1, QUESTION, TITLE_FQN),
          'questionType'
        ]
      },
      minItems: 1,
      default: [{}]
    }
  }
};

const questionsUiSchema = {
  [getPageSectionKey(2, 1)]: {
    classNames: 'column-span-12',
    'ui:options': {
      addButtonText: '+ Add Question'
    },
    items: {
      classNames: 'grid-container',
      [getEntityAddressKey(-1, QUESTION, TITLE_FQN)]: {
        classNames: 'column-span-12',
        'ui:autofocus': true
      },
      questionType: {
        classNames: 'column-span-12',
        'ui:widget': 'RadioWidget',
      },
      [getEntityAddressKey(-1, QUESTION, VALUES_FQN)]: {
        classNames: 'column-span-12',
        'ui:options': {
          creatable: true,
          multiple: true,
          noOptionsMessage: 'Type to create',
        },
        'ui:autofocus': true
      }
    },
  }
};

const schedulerSchema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(3, 1)]: {
      type: 'object',
      title: 'Notification trigger settings',
      properties: {
        daysOfWeek: {
          title: 'Days of week to send notification',
          type: 'array',
          items: {
            // $FlowFixMe
            enum: Info.weekdays(),
            type: 'string'
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
  [getPageSectionKey(3, 1)]: {
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
          'ui:autofocus': true,
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
