// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import SCHEMA_FIELDS_TITLES from '../constants/SchemaFieldsTitles';
import {
  NON_TYPICAL_SLEEP_REASONS,
  PROPERTY_CONSTS,
  SLEEP_ARRANGEMENT_OPTIONS,
  WAKE_UP_COUNT_OPTIONS,
  BG_MEDIA_OPTIONS
} from '../constants/SchemaConstants';

const { getPageSectionKey } = DataProcessingUtils;

const {
  BG_AUDIO_NIGHT,
  BG_TV_NIGHT,
  NON_TYPICAL_SLEEP_PATTERN,
  SLEEP_ARRANGEMENT,
  SLEEP_PATTERN,
  WAKE_UP_COUNT,
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
        [BG_TV_NIGHT]: {
          type: 'string',
          title: 'Was there a TV playing in the room while your child slept at night?',
          enum: BG_MEDIA_OPTIONS
        },
        [BG_AUDIO_NIGHT]: {
          type: 'string',
          title: 'Was there music or other audio playing in the room while your child slept at night?',
          enum: BG_MEDIA_OPTIONS
        }
      },
      required: [SLEEP_PATTERN, SLEEP_ARRANGEMENT, WAKE_UP_COUNT, BG_TV_NIGHT, BG_AUDIO_NIGHT],
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
      }
    }
  }
});

const createUiSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 0)]: {
    classNames: 'column-span-12 grid-container',
    'ui:order': [SLEEP_PATTERN, NON_TYPICAL_SLEEP_PATTERN, SLEEP_ARRANGEMENT, WAKE_UP_COUNT, BG_TV_NIGHT,
      BG_AUDIO_NIGHT],
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
    [BG_TV_NIGHT]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [BG_AUDIO_NIGHT]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
  }
});

export {
  createSchema,
  createUiSchema
};
