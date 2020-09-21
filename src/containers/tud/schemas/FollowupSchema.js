// @flow

import SCHEMA_FIELDS_TITLES from '../constants/SchemaFieldsTitles';
import { ACTIVITY_NAMES } from '../constants/ActivitiesConstants';
import {
  BOOK_TYPES,
  MEDIA_ACTIVITY_CATEGORIES,
  MEDIA_DEVICE_TYPES,
  PROPERTY_CONSTS,
  MEDIA_AGE_OPTIONS
} from '../constants/SchemaConstants';

const {
  BOOK_TITLE,
  BOOK_TYPE,
  DEVICE,
  MEDIA_ACTIVITY,
  MEDIA_AGE,
  MEDIA_NAME,
} = PROPERTY_CONSTS;
const { READING, MEDIA_USE } = ACTIVITY_NAMES;

const createSchema = (selectedActivity :string) => {
  switch (selectedActivity) {
    case READING: {
      return {
        properties: {
          [BOOK_TYPE]: {
            type: 'array',
            title: SCHEMA_FIELDS_TITLES[BOOK_TYPE],
            description: 'Please choose all that apply.',
            items: {
              type: 'string',
              enum: BOOK_TYPES
            },
            uniqueItems: true,
            minItems: 1
          },
          [BOOK_TITLE]: {
            type: 'string',
            title: SCHEMA_FIELDS_TITLES[BOOK_TITLE]
          }
        },
        required: [BOOK_TYPE]
      };
    }
    case MEDIA_USE:
      return {
        properties: {
          [DEVICE]: {
            title: `Specifically, what device(s) was your child using while ${selectedActivity}?`,
            description: 'Please choose all that apply.',
            type: 'array',
            items: {
              type: 'string',
              enum: MEDIA_DEVICE_TYPES
            },
            uniqueItems: true,
            minItems: 1
          },
          [MEDIA_ACTIVITY]: {
            title: SCHEMA_FIELDS_TITLES[MEDIA_ACTIVITY],
            type: 'string',
            enum: MEDIA_ACTIVITY_CATEGORIES
          },
          [MEDIA_AGE]: {
            title: SCHEMA_FIELDS_TITLES[MEDIA_AGE],
            type: 'string',
            enum: MEDIA_AGE_OPTIONS
          },
          [MEDIA_NAME]: {
            title: SCHEMA_FIELDS_TITLES[MEDIA_NAME],
            type: 'string'
          }
        },
        required: [DEVICE, MEDIA_ACTIVITY, MEDIA_AGE]
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
  [DEVICE]: {
    classNames: 'column-span-12',
    'ui:widget': 'checkboxes',
    'ui:options': {
      withOther: true
    }
  },
  [MEDIA_ACTIVITY]: {
    classNames: 'column-span-12',
    'ui:widget': 'radio'
  },
  [BOOK_TYPE]: {
    classNames: 'column-span-12',
    'ui:widget': 'checkboxes',
    'ui:options': {
      withOther: true
    }
  },
  [BOOK_TITLE]: {
    classNames: 'column-span-12',
  },
  [MEDIA_AGE]: {
    classNames: 'column-span-12',
    'ui:widget': 'radio'
  },
  [MEDIA_NAME]: {
    classNames: 'column-span-12'
  }
};

export {
  createSchema,
  uiSchema
};
