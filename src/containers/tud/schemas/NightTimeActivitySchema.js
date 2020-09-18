// @flow
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import SCHEMA_FIELDS_TITLES from '../constants/SchemaFieldsTitles';
import {
  PROPERTY_CONSTS,
  WAKE_UP_COUNT_OPTIONS,
  NON_TYPICAL_SLEEP_REASONS,
  SLEEP_ARRANGEMENT_OPTIONS,
} from '../constants/SchemaConstants';

const { getPageSectionKey } = DataProcessingUtils;

const {
  WAKE_UP_COUNT,
  SLEEP_PATTERN,
  SLEEP_ARRANGEMENT,
  NON_TYPICAL_SLEEP_PATTERN,
  BG_TV,
  BG_TV_AGE
} = PROPERTY_CONSTS;
const createSchema = (pageNum :number, bedTime :DateTime) => {
  const formatedTime = bedTime.toLocaleString(DateTime.TIME_24_SIMPLE);

  return {
    type: 'object',
    title: '',
    properties: {
      [getPageSectionKey(pageNum, 0)]: {
        type: 'object',
        title: '',
        properties: {
          [SLEEP_PATTERN]: {
            type: 'string',
            title: SCHEMA_FIELDS_TITLES[SLEEP_PATTERN],
            enum: ['Yes', 'No', 'Don\'t know']
          },
          [SLEEP_ARRANGEMENT]: {
            type: 'array',
            title: SCHEMA_FIELDS_TITLES[SLEEP_ARRANGEMENT],
            items: {
              type: 'string',
              enum: SLEEP_ARRANGEMENT_OPTIONS
            },
            uniqueItems: true,
            minItems: 1
          },
          [WAKE_UP_COUNT]: {
            type: 'string',
            title: SCHEMA_FIELDS_TITLES[WAKE_UP_COUNT],
            enum: WAKE_UP_COUNT_OPTIONS
          },
          [BG_TV]: {
            type: 'string',
            title: 'Was there a TV on in the background while your child slept at night?',
            enum: ['Yes', 'No', 'Don\'t know']
          }
        },
        required: [SLEEP_PATTERN, SLEEP_ARRANGEMENT, WAKE_UP_COUNT, BG_TV],
        dependencies: {
          [SLEEP_PATTERN]: {
            oneOf: [
              {
                properties: {
                  [SLEEP_PATTERN]: {
                    enum: ['No']
                  },
                  [NON_TYPICAL_SLEEP_PATTERN]: {
                    type: 'array',
                    items: {
                      type: 'string',
                      enum: NON_TYPICAL_SLEEP_REASONS
                    },
                    uniqueItems: true
                  }
                },
                required: [NON_TYPICAL_SLEEP_PATTERN]
              },
              {
                properties: {
                  [SLEEP_PATTERN]: {
                    enum: ['Yes', 'Don\'t know']
                  },
                }
              }
            ]
          },
          [BG_TV]: {
            oneOf: [
              {
                properties: {
                  [BG_TV]: {
                    enum: ['No', "Don't Know"]
                  },
                }
              },
              {
                properties: {
                  [BG_TV]: {
                    enum: ['Yes']
                  },
                  [BG_TV_AGE]: {
                    title: SCHEMA_FIELDS_TITLES[BG_TV_AGE],
                    type: 'array',
                    items: {
                      type: 'string',
                      enum: ["Child's age", 'Older children', 'Younger children', 'Adults', 'Don`t know'],
                    },
                    uniqueItems: true
                  }
                },
                required: [BG_TV_AGE]
              }
            ]
          }
        }
      }
    }
  };
};

const createUiSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 0)]: {
    classNames: 'column-span-12 grid-container',
    [NON_TYPICAL_SLEEP_PATTERN]: {
      classNames: 'column-span-12',
      'ui:widget': 'OtherRadioWidget'
    },
    [SLEEP_ARRANGEMENT]: {
      classNames: 'column-span-12',
      'ui:widget': 'checkboxes',
      'ui:options': {
        withOther: true
      }
    },
    [WAKE_UP_COUNT]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [BG_TV]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [BG_TV_AGE]: {
      classNames: 'column-span-12',
      'ui:widget': 'OtherRadioWidget',
    },
  }
});

export {
  createSchema,
  createUiSchema
};
