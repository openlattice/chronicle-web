// @flow
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import TranslationKeys from '../constants/TranslationKeys';
import { PAGE_NUMBERS } from '../constants/GeneralConstants';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

const { getPageSectionKey } = DataProcessingUtils;

const { DAY_SPAN_PAGE, FIRST_ACTIVITY_PAGE } = PAGE_NUMBERS;

const {
  ACTIVITY_END_TIME,
  ACTIVITY_NAME,
  ACTIVITY_START_TIME,
} = PROPERTY_CONSTS;

const createSchema = (
  pageNum :number,
  prevActivity :string,
  currentActivity :string,
  prevEndTime :DateTime,
  is12hourFormat :boolean,
  trans :(string, ?Object) => string
) => ({
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(pageNum, 0)]: {
      title: '',
      type: 'object',
      properties: {
        [ACTIVITY_NAME]: {
          type: 'string',
          title: (pageNum === FIRST_ACTIVITY_PAGE
            ? trans(TranslationKeys.PRIMARY_ACTIVITY, { time: prevEndTime.toLocaleString(DateTime.TIME_SIMPLE) })
            : trans(TranslationKeys.NEXT_ACTIVITY, {
              time: prevEndTime.toLocaleString(DateTime.TIME_SIMPLE),
              activity: prevActivity,
              interpolation: { escapeValue: false }
            })),
          enum: Object.values(trans(TranslationKeys.PRIMARY_ACTIVITIES, { returnObjects: true }))
        },
        [ACTIVITY_START_TIME]: {
          type: 'string',
          title: '',
          default: prevEndTime.toLocaleString(DateTime.TIME_24_SIMPLE)
        },
        [ACTIVITY_END_TIME]: {
          id: 'end_time',
          type: 'string',
          title: currentActivity
            ? trans(
              TranslationKeys.ACTIVITY_END_TIME, { activity: currentActivity, interpolation: { escapeValue: false } }
            )
            : trans(TranslationKeys.DEFAULT_END_TIME),
          description: trans(TranslationKeys.DEFAULT_TIME),
          default: prevEndTime.toLocaleString(DateTime.TIME_24_SIMPLE)
        },
      },
      required: [ACTIVITY_NAME, ACTIVITY_END_TIME]
    }
  },
});

const createUiSchema = (pageNum :number, is12hourFormat :boolean) => ({
  [getPageSectionKey(pageNum, 0)]: {
    classNames: 'column-span-12 grid-container',
    [ACTIVITY_NAME]: {
      classNames: (pageNum === DAY_SPAN_PAGE ? 'hidden' : 'column-span-12')
    },
    [ACTIVITY_START_TIME]: {
      classNames: (pageNum === DAY_SPAN_PAGE ? 'column-span-12' : 'hidden'),
      'ui:widget': 'TimeWidget',
      'ui:options': {
        ampm: is12hourFormat
      }
    },
    [ACTIVITY_END_TIME]: {
      classNames: 'column-span-12',
      'ui:widget': 'TimeWidget',
      'ui:options': {
        ampm: is12hourFormat
      }
    },
  },
});

export {
  createSchema,
  createUiSchema
};
