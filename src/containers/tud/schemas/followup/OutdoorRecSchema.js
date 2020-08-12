// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import SCHEMA_FIELDS_TITLES from '../../constants/SchemaFieldsTitles';
import { CAREGIVERS, PROPERTY_CONSTS } from '../../constants/SchemaConstants';

const {
  CAREGIVER,
  MEDIA,
  BG_AUDIO,
  ADULT_MEDIA
} = PROPERTY_CONSTS;

const { getPageSectionKey } = DataProcessingUtils;

const createSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 1)]: {
    type: 'object',
    title: '',
    properties: {
      [CAREGIVER]: {
        type: 'array',
        title: SCHEMA_FIELDS_TITLES[CAREGIVER],
        items: {
          type: 'string',
          enum: CAREGIVERS
        },
        uniqueItems: true,
        minItems: 1
      },
      [MEDIA]: {
        type: 'string',
        title: SCHEMA_FIELDS_TITLES[MEDIA],
        enum: ['Yes', 'No', "Don't Know"]
      }
    },
    required: [CAREGIVER, MEDIA],
    dependencies: {
      [MEDIA]: {
        oneOf: [
          {
            properties: {
              [MEDIA]: {
                enum: ['Yes']
              },
              [BG_AUDIO]: {
                title: SCHEMA_FIELDS_TITLES[BG_AUDIO],
                type: 'string',
                enum: ['Yes', 'No', "Don't Know"]
              },
              [ADULT_MEDIA]: {
                type: 'string',
                title: SCHEMA_FIELDS_TITLES[ADULT_MEDIA],
                enum: ['Yes', 'No', "Don't Know"]
              }
            },
            required: [BG_AUDIO, ADULT_MEDIA]
          },
          {
            properties: {
              [MEDIA]: {
                enum: ['No', "Don't Know"]
              },
              [ADULT_MEDIA]: {
                type: 'string',
                title: SCHEMA_FIELDS_TITLES[ADULT_MEDIA],
                enum: ['Yes', 'No', "Don't Know"]
              }
            },
            required: [ADULT_MEDIA]
          }
        ]
      }
    }
  }
});

const createUiSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 1)]: {
    classNames: 'column-span-12 grid-container'
  },
  [CAREGIVER]: {
    classNames: 'column-span-12',
    'ui:widget': 'checkboxes',
    'ui:options': {
      withNone: true,
      noneText: 'No one'
    }
  },
  [ADULT_MEDIA]: {
    classNames: 'column-span-12',
    'ui:widget': 'radio',
  },
  [MEDIA]: {
    classNames: 'column-span-12',
    'ui:widget': 'radio',
  },
  [BG_AUDIO]: {
    classNames: 'column-span-12',
    'ui:widget': 'radio',
  }
});

export {
  createSchema,
  createUiSchema
};
