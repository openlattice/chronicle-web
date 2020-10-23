// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import SCHEMA_FIELDS_TITLES from '../constants/SchemaFieldsTitles';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

const { DAY_END_TIME, DAY_START_TIME, TODAY_WAKEUP_TIME } = PROPERTY_CONSTS;
const { getPageSectionKey } = DataProcessingUtils;

const schema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(1, 0)]: {
      type: 'object',
      title: '',
      properties: {
        [DAY_START_TIME]: {
          type: 'string',
          title: SCHEMA_FIELDS_TITLES[DAY_START_TIME],
          description: 'Please enter time by typing in the box below (e.g., 07:00 AM)'
            + ' or clicking on the clock button.',
        },
        [DAY_END_TIME]: {
          type: 'string',
          title: SCHEMA_FIELDS_TITLES[DAY_END_TIME],
          description: 'Please enter time by typing in the box below (e.g., 07:00 PM)'
            + ' or clicking on the clock button.',
        },
        [TODAY_WAKEUP_TIME]: {
          type: 'string',
          title: SCHEMA_FIELDS_TITLES[TODAY_WAKEUP_TIME],
          description: 'Please enter time by typing in the box below (e.g., 07:00 AM)'
            + ' or clicking on the clock button.',
        }
      },
      required: [DAY_START_TIME, DAY_END_TIME]
    }
  }
};

const uiSchema = {
  [getPageSectionKey(1, 0)]: {
    classNames: 'column-span-12 grid-container',
    [DAY_START_TIME]: {
      classNames: 'column-span-12',
      'ui:widget': 'TimeWidget',
      'ui:placeholder': 'HH:MM AM'
    },
    [DAY_END_TIME]: {
      classNames: 'column-span-12',
      'ui:widget': 'TimeWidget',
      'ui:placeholder': 'HH:MM PM'
    },
    [TODAY_WAKEUP_TIME]: {
      classNames: 'column-span-12',
      'ui:widget': 'TimeWidget',
      'ui:placeholder': 'HH:MM AM'
    }
  }
};

export {
  schema,
  uiSchema
};
