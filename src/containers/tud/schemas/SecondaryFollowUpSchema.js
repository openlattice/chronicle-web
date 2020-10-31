// @flow

import SCHEMA_FIELDS_TITLES from '../constants/SchemaFieldsTitles';
import {
  BOOK_TYPES,
  MEDIA_ACTIVITY_CATEGORIES,
  MEDIA_AGE_OPTIONS,
  PRIMARY_ACTIVITIES,
  PROPERTY_CONSTS,
} from '../constants/SchemaConstants';

const {
  SECONDARY_BOOK_TITLE,
  SECONDARY_BOOK_TYPE,
  SECONDARY_MEDIA_ACTIVITY,
  SECONDARY_MEDIA_AGE,
  SECONDARY_MEDIA_NAME,
} = PROPERTY_CONSTS;
const { READING, MEDIA_USE } = PRIMARY_ACTIVITIES;

const createSchema = (selectedActivity :string) => {
  switch (selectedActivity) {
    case READING: {
      return {
        properties: {
          [SECONDARY_BOOK_TYPE]: {
            type: 'array',
            title: SCHEMA_FIELDS_TITLES[SECONDARY_BOOK_TYPE],
            description: 'Please choose all that apply.',
            items: {
              type: 'string',
              enum: BOOK_TYPES
            },
            uniqueItems: true,
            minItems: 1
          },
          [SECONDARY_BOOK_TITLE]: {
            type: 'string',
            title: SCHEMA_FIELDS_TITLES[SECONDARY_BOOK_TITLE]
          }
        },
        required: [SECONDARY_BOOK_TYPE]
      };
    }
    case MEDIA_USE:
      return {
        properties: {
          [SECONDARY_MEDIA_ACTIVITY]: {
            title: SCHEMA_FIELDS_TITLES[SECONDARY_MEDIA_ACTIVITY],
            type: 'array',
            description: 'Please choose all that apply.',
            items: {
              enum: MEDIA_ACTIVITY_CATEGORIES,
              type: 'string'
            },
            uniqueItems: true,
            minItems: 1
          },
          [SECONDARY_MEDIA_AGE]: {
            title: SCHEMA_FIELDS_TITLES[SECONDARY_MEDIA_AGE],
            type: 'string',
            enum: MEDIA_AGE_OPTIONS
          },
          [SECONDARY_MEDIA_NAME]: {
            title: SCHEMA_FIELDS_TITLES[SECONDARY_MEDIA_NAME],
            type: 'string'
          }
        },
        required: [SECONDARY_MEDIA_ACTIVITY, SECONDARY_MEDIA_AGE]
      };
    default: {
      return {
        properties: {},
        required: []
      };
    }
  }
};

const uiSchema = {
  [SECONDARY_MEDIA_ACTIVITY]: {
    classNames: 'column-span-12',
    'ui:widget': 'checkboxes',
    'ui:options': {
      withOther: true
    }
  },
  [SECONDARY_BOOK_TYPE]: {
    classNames: 'column-span-12',
    'ui:widget': 'checkboxes',
    'ui:options': {
      withOther: true
    }
  },
  [SECONDARY_BOOK_TITLE]: {
    classNames: 'column-span-12',
  },
  [SECONDARY_MEDIA_AGE]: {
    classNames: 'column-span-12',
    'ui:widget': 'radio'
  },
  [SECONDARY_MEDIA_NAME]: {
    classNames: 'column-span-12'
  }
};

export {
  createSchema,
  uiSchema
};
