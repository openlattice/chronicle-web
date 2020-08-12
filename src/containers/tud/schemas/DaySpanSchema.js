// @flow
import { DataProcessingUtils } from 'lattice-fabricate';

import SCHEMA_FIELDS_TITLES from '../constants/SchemaFieldsTitles';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

const { DAY_END_TIME, DAY_START_TIME } = PROPERTY_CONSTS;
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
          title: SCHEMA_FIELDS_TITLES[DAY_START_TIME]
        },
        [DAY_END_TIME]: {
          type: 'string',
          title: SCHEMA_FIELDS_TITLES[DAY_END_TIME]
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
