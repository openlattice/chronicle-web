// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import SCHEMA_FIELDS_TITLES from '../../constants/SchemaFieldsTitles';
import {
  CAREGIVERS,
  CHILD_BEHAVIOR_CATEGORIES,
  LOCATION_CATEGORIES,
  MEDIA_ACTIVITY_CATEGORIES,
  MEDIA_DEVICE_TYPES,
  PROPERTY_CONSTS
} from '../../constants/SchemaConstants';

const { getPageSectionKey } = DataProcessingUtils;

const {
  ADULT_MEDIA,
  ADULT_MEDIA_PROPORTION,
  ADULT_MEDIA_PURPOSE,
  BEHAVIOR_AFTER,
  BEHAVIOR_BEFORE,
  CAREGIVER,
  DEVICE,
  LOCATION,
  MEDIA_ACTIVITY,
  MEDIA_NAME,
  OTHER_MEDIA,
  PROGRAM_AGE,
} = PROPERTY_CONSTS;

const otherMediaSchema = {
  properties: {
    [OTHER_MEDIA]: {
      type: 'string',
      title: SCHEMA_FIELDS_TITLES[OTHER_MEDIA],
      enum: ['Yes', 'No', "Don't Know"]
    },
    [BEHAVIOR_BEFORE]: {
      type: 'string',
      title: SCHEMA_FIELDS_TITLES[BEHAVIOR_BEFORE],
      enum: CHILD_BEHAVIOR_CATEGORIES
    },
    [BEHAVIOR_AFTER]: {
      type: 'string',
      title: SCHEMA_FIELDS_TITLES[BEHAVIOR_AFTER],
      enum: CHILD_BEHAVIOR_CATEGORIES
    }
  },
  required: [OTHER_MEDIA, BEHAVIOR_BEFORE, BEHAVIOR_AFTER]
};

const subSchema = {
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
    [LOCATION]: {
      type: 'string',
      title: SCHEMA_FIELDS_TITLES[LOCATION],
      enum: LOCATION_CATEGORIES
    },
    [ADULT_MEDIA]: {
      type: 'string',
      title: SCHEMA_FIELDS_TITLES[ADULT_MEDIA],
      enum: ['Yes', 'No', "Don't Know"]
    },
  },
  required: [CAREGIVER, LOCATION, ADULT_MEDIA],
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
            [ADULT_MEDIA_PROPORTION]: {
              type: 'number',
              title: SCHEMA_FIELDS_TITLES[ADULT_MEDIA_PROPORTION],
            },
            ...otherMediaSchema.properties
          },
          required: [ADULT_MEDIA_PURPOSE, ADULT_MEDIA_PROPORTION, ...otherMediaSchema.required]
        },
        {
          properties: {
            [ADULT_MEDIA]: {
              enum: ['No', "Don't Know"]
            },
            ...otherMediaSchema.properties
          },
          required: otherMediaSchema.required
        }
      ]
    }
  },
};

const createSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 1)]: {
    title: '',
    type: 'object',
    properties: {
      [DEVICE]: {
        type: 'array',
        title: SCHEMA_FIELDS_TITLES[DEVICE],
        items: {
          type: 'string',
          enum: MEDIA_DEVICE_TYPES
        },
        uniqueItems: true,
        minItems: 1
      },
      [MEDIA_ACTIVITY]: {
        type: 'string',
        title: SCHEMA_FIELDS_TITLES[MEDIA_ACTIVITY],
        enum: MEDIA_ACTIVITY_CATEGORIES,
      }
    },
    required: [DEVICE, MEDIA_ACTIVITY],
    dependencies: {
      [MEDIA_ACTIVITY]: {
        oneOf: [
          {
            properties: {
              [MEDIA_ACTIVITY]: {
                enum: MEDIA_ACTIVITY_CATEGORIES.slice(0, 4)
              },
              [PROGRAM_AGE]: {
                type: 'string',
                title: SCHEMA_FIELDS_TITLES[PROGRAM_AGE],
                enum: ["Child's age", 'Older children', 'Younger children', 'Adults', "Don't know/other"]
              },
              [MEDIA_NAME]: {
                type: 'string',
                title: SCHEMA_FIELDS_TITLES[MEDIA_NAME]
              },
              ...subSchema.properties
            },
            required: [PROGRAM_AGE, ...subSchema.required],
            dependencies: {
              ...subSchema.dependencies
            }
          },
          {
            properties: {
              [MEDIA_ACTIVITY]: {
                enum: MEDIA_ACTIVITY_CATEGORIES.slice(4)
              },
              ...subSchema.properties
            },
            dependencies: {
              ...subSchema.dependencies
            },
            required: subSchema.required
          }
        ]
      }
    }

  }
});

const createUiSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 1)]: {
    classNames: 'column-span-12 grid-container',
    [DEVICE]: {
      classNames: 'column-span-12',
      'ui:widget': 'checkboxes',
      'ui:options': {
        withOther: true
      }
    },
    [MEDIA_ACTIVITY]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio',
      'ui:options': {
        withOther: true
      }
    },
    [PROGRAM_AGE]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [MEDIA_NAME]: {
      classNames: 'column-span-12'
    },
    [CAREGIVER]: {
      classNames: 'column-span-12',
      'ui:widget': 'checkboxes',
      'ui:options': {
        noneText: 'No one'
      }
    },
    [ADULT_MEDIA]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [LOCATION]: {
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
    [OTHER_MEDIA]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [BEHAVIOR_BEFORE]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [BEHAVIOR_AFTER]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [ADULT_MEDIA_PROPORTION]: {
      classNames: 'column-span-12'
    }
  }
});

export {
  createSchema,
  createUiSchema
};
