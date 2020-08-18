// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import SCHEMA_FIELDS_TITLES from '../../constants/SchemaFieldsTitles';
import { CAREGIVERS, PROPERTY_CONSTS, SECONDARY_LOCATIONS } from '../../constants/SchemaConstants';

const {
  SECONDARY_LOCATION,
  MEDIA,
  CAREGIVER,
  MEDIA_AGE,
  BG_AUDIO,
  ADULT_MEDIA,
  ADULT_MEDIA_PURPOSE
} = PROPERTY_CONSTS;

const { getPageSectionKey } = DataProcessingUtils;

const adultMediaSchema = {
  properties: {
    [ADULT_MEDIA]: {
      type: 'string',
      title: SCHEMA_FIELDS_TITLES[ADULT_MEDIA],
      enum: ['Yes', 'No', "Don't Know"]
    },
  },
  required: [ADULT_MEDIA],
  dependencies: {
    [ADULT_MEDIA]: {
      oneOf: [
        {
          properties: {
            [ADULT_MEDIA]: {
              enum: ['Yes']
            },
            [ADULT_MEDIA_PURPOSE]: {
              type: 'array',
              title: SCHEMA_FIELDS_TITLES[ADULT_MEDIA_PURPOSE],
              items: {
                type: 'string',
                enum: ['Work call', 'Work email', 'Review of documents for work',
                  'Social call', 'Entertainment', 'Social media']
              },
              uniqueItems: true,
              minItems: 1
            },
          },
          required: [ADULT_MEDIA_PURPOSE]
        },
        {
          properties: {
            [ADULT_MEDIA]: {
              enum: ['No', "Don't Know"]
            },
          }
        }
      ]
    }
  }
};

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
      [SECONDARY_LOCATION]: {
        type: 'string',
        title: SCHEMA_FIELDS_TITLES[SECONDARY_LOCATION],
        enum: SECONDARY_LOCATIONS
      },
      [MEDIA]: {
        type: 'string',
        title: SCHEMA_FIELDS_TITLES[MEDIA],
        enum: ['Yes', 'No', "Don't Know"]
      }
    },
    required: [CAREGIVER, SECONDARY_LOCATION, MEDIA],
    dependencies: {
      [MEDIA]: {
        oneOf: [
          {
            properties: {
              [MEDIA]: {
                enum: ['Yes']
              },
              [MEDIA_AGE]: {
                type: 'array',
                title: SCHEMA_FIELDS_TITLES[MEDIA_AGE],
                items: {
                  type: 'string',
                  enum: ["Child's age", 'Older children', 'Younger children', 'Adults']
                },
                uniqueItems: true
              },
              [BG_AUDIO]: {
                title: SCHEMA_FIELDS_TITLES[BG_AUDIO],
                type: 'string',
                enum: ['Yes', 'No', "Don't Know"]
              },
              ...adultMediaSchema.properties
            },
            required: [MEDIA_AGE, BG_AUDIO, ...adultMediaSchema.required],
            dependencies: {
              ...adultMediaSchema.dependencies
            }
          },
          {
            properties: {
              [MEDIA]: {
                enum: ['No', "Don't Know"]
              },
              ...adultMediaSchema.properties
            },
            required: adultMediaSchema.required,
            dependencies: {
              ...adultMediaSchema.dependencies
            }
          }
        ]
      }
    }
  }
});

const createUiSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 1)]: {
    classNames: 'column-span-12 grid-container',
    [MEDIA]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [MEDIA_AGE]: {
      classNames: 'column-span-12',
      'ui:widget': 'OtherRadioWidget',
      'ui:options': {
        otherText: 'Don\'t know/other'
      }
    },
    [SECONDARY_LOCATION]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [CAREGIVER]: {
      classNames: 'column-span-12',
      'ui:widget': 'checkboxes',
      'ui:options': {
        withNone: true,
        noneText: 'No one'
      }
    },
    [BG_AUDIO]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [ADULT_MEDIA]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [ADULT_MEDIA_PURPOSE]: {
      classNames: 'column-span-12',
      'ui:widget': 'checkboxes',
      'ui:options': {
        withNone: true,
        noneText: "Don't know"
      }
    },
  }
});

export {
  createSchema,
  createUiSchema
};
