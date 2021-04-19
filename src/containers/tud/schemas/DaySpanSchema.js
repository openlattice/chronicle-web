// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import TranslationKeys from '../constants/TranslationKeys';
import { PAGE_NUMBERS } from '../constants/GeneralConstants';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

const { DAY_END_TIME, DAY_START_TIME, TODAY_WAKEUP_TIME } = PROPERTY_CONSTS;

const { DAY_SPAN_PAGE } = PAGE_NUMBERS;

const { getPageSectionKey } = DataProcessingUtils;

const createSchema = (is12hourFormat :boolean, trans :(string) => string) => ({
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(DAY_SPAN_PAGE, 0)]: {
      type: 'object',
      title: '',
      properties: {
        [DAY_START_TIME]: {
          type: 'string',
          title: trans(TranslationKeys.DAY_START_TIME),
          description: trans(TranslationKeys.DEFAULT_TIME),
          default: '07:00'
        },
        [DAY_END_TIME]: {
          type: 'string',
          title: trans(TranslationKeys.DAY_END_TIME),
          description: trans(TranslationKeys.DEFAULT_TIME),
          default: '19:00'
        },
        [TODAY_WAKEUP_TIME]: {
          type: 'string',
          title: trans(TranslationKeys.TODAY_WAKEUP_TIME),
          description: trans(TranslationKeys.DEFAULT_TIME),
          default: '07:00'
        }
      },
      required: [DAY_START_TIME, DAY_END_TIME, TODAY_WAKEUP_TIME]
    }
  }
});

const createUiSchema = (is12hourFormat :boolean) => ({
  [getPageSectionKey(DAY_SPAN_PAGE, 0)]: {
    classNames: 'column-span-12 grid-container',
    [DAY_START_TIME]: {
      classNames: 'column-span-12',
      'ui:widget': 'TimeWidget',
      'ui:placeholder': 'HH:MM AM',
      'ui:options': {
        ampm: is12hourFormat
      }
    },
    [DAY_END_TIME]: {
      classNames: 'column-span-12',
      'ui:widget': 'TimeWidget',
      'ui:placeholder': 'HH:MM PM',
      'ui:options': {
        ampm: is12hourFormat
      }
    },
    [TODAY_WAKEUP_TIME]: {
      classNames: 'column-span-12',
      'ui:widget': 'TimeWidget',
      'ui:placeholder': 'HH:MM AM',
      'ui:options': {
        ampm: is12hourFormat
      }
    }
  }
});

export {
  createSchema,
  createUiSchema
};
