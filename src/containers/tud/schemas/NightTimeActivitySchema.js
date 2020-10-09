// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import SCHEMA_FIELDS_TITLES from '../constants/SchemaFieldsTitles';
import {
  BG_MEDIA_PROPORTION_OPTIONS,
  NON_TYPICAL_SLEEP_REASONS,
  PROPERTY_CONSTS,
  SLEEP_ARRANGEMENT_OPTIONS,
  WAKE_UP_COUNT_OPTIONS
} from '../constants/SchemaConstants';

const { getPageSectionKey } = DataProcessingUtils;

const {
  WAKE_UP_COUNT,
  SLEEP_PATTERN,
  SLEEP_ARRANGEMENT,
  NON_TYPICAL_SLEEP_PATTERN,
  BG_TV,
  BG_TV_AGE,
  BG_AUDIO,
  BG_AUDIO_TYPE,
  BG_MEDIA_PROPORTION
} = PROPERTY_CONSTS;

const createSchema = (pageNum :number) => ({
  type: 'object',
  title: 'Nighttime Activity',
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
        },
        [BG_AUDIO]: {
          type: 'string',
          title: 'Was there audio entertainment(e.g. music, talk radio)'
            + ' on in the background while your child slept at night?',
          enum: ['Yes', 'No', 'Don\'t know']
        }
      },
      required: [SLEEP_PATTERN, SLEEP_ARRANGEMENT, WAKE_UP_COUNT, BG_TV, BG_AUDIO],
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
                  title: SCHEMA_FIELDS_TITLES[NON_TYPICAL_SLEEP_PATTERN],
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
        [BG_AUDIO]: {
          oneOf: [
            {
              properties: {
                [BG_AUDIO]: {
                  enum: ['No', 'Don\'t know']
                }
              }
            },
            {
              properties: {
                [BG_AUDIO]: {
                  enum: ['Yes']
                },
                [BG_AUDIO_TYPE]: {
                  type: 'array',
                  title: SCHEMA_FIELDS_TITLES[BG_AUDIO_TYPE],
                  items: {
                    type: 'string',
                    enum: ['Music', 'Talk radio', 'Podcast', 'Don\'t know']
                  },
                  uniqueItems: true
                },
                [BG_MEDIA_PROPORTION]: {
                  type: 'string',
                  title: 'Approximately'
                    + ' what proportion of time that the child was sleeping was the background media in use?',
                  enum: BG_MEDIA_PROPORTION_OPTIONS
                }
              },
              required: [BG_AUDIO_TYPE, BG_MEDIA_PROPORTION]
            }
          ]
        },
        [BG_TV]: {
          oneOf: [
            {
              properties: {
                [BG_TV]: {
                  enum: ['No', "Don't know"]
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
                    enum: ["Child's age", 'Older children', 'Younger children', 'Adults', 'Don\'t know'],
                  },
                  uniqueItems: true,
                  minItems: 1
                },
                [BG_MEDIA_PROPORTION]: {
                  type: 'string',
                  title: 'Approximately'
                    + ' what proportion of time that the child was sleeping was the background media in use?',
                  enum: BG_MEDIA_PROPORTION_OPTIONS
                }
              },
              required: [BG_TV_AGE, BG_MEDIA_PROPORTION]
            }
          ]
        }
      }
    }
  }
});

const createUiSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 0)]: {
    classNames: 'column-span-12 grid-container',
    'ui:order': [SLEEP_PATTERN, NON_TYPICAL_SLEEP_PATTERN, SLEEP_ARRANGEMENT, WAKE_UP_COUNT, BG_TV,
      BG_TV_AGE, BG_AUDIO, BG_AUDIO_TYPE, BG_MEDIA_PROPORTION],
    [SLEEP_PATTERN]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [NON_TYPICAL_SLEEP_PATTERN]: {
      classNames: 'column-span-12',
      'ui:widget': 'OtherRadioWidget'
    },
    [SLEEP_ARRANGEMENT]: {
      classNames: 'column-span-12',
      'ui:widget': 'OtherRadioWidget'
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
    [BG_AUDIO]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [BG_AUDIO_TYPE]: {
      classNames: 'column-span-12',
      'ui:widget': 'OtherRadioWidget',
      'ui:options': {
        withOther: true
      }
    },
    [BG_MEDIA_PROPORTION]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    }
  }
});

export {
  createSchema,
  createUiSchema
};
