import { DataProcessingUtils } from 'lattice-fabricate';

import { SCHEMA_CONSTANTS } from '../constants';

const { DAY_END_TIME, DAY_START_TIME } = SCHEMA_CONSTANTS;

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
          title: 'What time did your child wake up yesterday morning?'
        },
        [DAY_END_TIME]: {
          type: 'string',
          title: 'What time did your child go to bed yesterday night?'
        }
      },
      required: [DAY_START_TIME, DAY_END_TIME]
    }
  }
};

const uiSchema = {
  [getPageSectionKey(1, 0)]: {
    classNames: 'column-span-12',
    [DAY_START_TIME]: {
      classNames: 'column-span-12',
      'ui:widget': 'TimeWidget'
    },
    [DAY_END_TIME]: {
      classNames: 'column-span-12',
      'ui:widget': 'TimeWidget',
    }
  }
};

export {
  schema,
  uiSchema
};
