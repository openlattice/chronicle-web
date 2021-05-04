// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import TranslationKeys from '../constants/TranslationKeys';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

const { getPageSectionKey } = DataProcessingUtils;

const {
  BG_AUDIO_NIGHT,
  BG_TV_NIGHT,
  NON_TYPICAL_SLEEP_PATTERN,
  SLEEP_ARRANGEMENT,
  SLEEP_PATTERN,
  WAKE_UP_COUNT,
} = PROPERTY_CONSTS;

const createSchema = (pageNum :number, trans :(string, ?Object) => Object) => ({
  type: 'object',
  title: trans(TranslationKeys.NIGHTTIME_ACTIVITY_TITLE),
  properties: {
    [getPageSectionKey(pageNum, 0)]: {
      type: 'object',
      title: '',
      properties: {
        [SLEEP_PATTERN]: {
          type: 'string',
          title: trans(TranslationKeys.SLEEP_PATTERN),
          enum: [trans(TranslationKeys.YES), trans(TranslationKeys.NO), trans(TranslationKeys.DONT_KNOW)]
        },
        [SLEEP_ARRANGEMENT]: {
          type: 'array',
          title: trans(TranslationKeys.SLEEP_ARRANGEMENT),
          items: {
            type: 'string',
            enum: trans(TranslationKeys.SLEEP_ARRANGEMENT_OPTIONS, { returnObjects: true })
          },
          uniqueItems: true,
        },
        [WAKE_UP_COUNT]: {
          type: 'string',
          title: trans(TranslationKeys.WAKE_UP_COUNT),
          enum: trans(TranslationKeys.WAKE_UP_COUNT_OPTIONS, { returnObjects: true })
        },
        [BG_TV_NIGHT]: {
          type: 'string',
          title: trans(TranslationKeys.BG_TV_NIGHT),
          enum: trans(TranslationKeys.BG_MEDIA_OPTIONS, { returnObjects: true })
        },
        [BG_AUDIO_NIGHT]: {
          type: 'string',
          title: trans(TranslationKeys.BG_AUDIO_NIGHT),
          enum: trans(TranslationKeys.BG_MEDIA_OPTIONS, { returnObjects: true })
        }
      },
      required: [SLEEP_PATTERN, SLEEP_ARRANGEMENT, WAKE_UP_COUNT, BG_TV_NIGHT, BG_AUDIO_NIGHT],
      dependencies: {
        [SLEEP_PATTERN]: {
          oneOf: [
            {
              properties: {
                [SLEEP_PATTERN]: {
                  enum: [trans(TranslationKeys.NO)]
                },
                [NON_TYPICAL_SLEEP_PATTERN]: {
                  type: 'array',
                  title: trans(TranslationKeys.NON_TYPICAL_SLEEP_PATTERN),
                  items: {
                    type: 'string',
                    enum: trans(TranslationKeys.NON_TYPICAL_SLEEP_OPTIONS, { returnObjects: true })
                  },
                  uniqueItems: true
                }
              },
              required: [NON_TYPICAL_SLEEP_PATTERN]
            },
            {
              properties: {
                [SLEEP_PATTERN]: {
                  enum: [trans(TranslationKeys.YES), trans(TranslationKeys.DONT_KNOW)]
                },
              }
            }
          ]
        },
      }
    }
  }
});

const createUiSchema = (pageNum :number, trans :(string, ?Object) => Object) => ({
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
      'ui:widget': 'OtherRadioWidget',
      'ui:options': {
        otherText: trans(TranslationKeys.OTHER)
      }
    },
    [SLEEP_ARRANGEMENT]: {
      classNames: 'column-span-12',
      'ui:widget': 'OtherRadioWidget',
      'ui:options': {
        otherText: trans(TranslationKeys.OTHER)
      }
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
