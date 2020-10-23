// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import SCHEMA_FIELDS_TITLES from '../constants/SchemaFieldsTitles';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

const { getPageSectionKey } = DataProcessingUtils;
const { CLOCK_FORMAT } = PROPERTY_CONSTS;

const schema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(0, 0)]: {
      type: 'object',
      title: '',
      properties: {
        [CLOCK_FORMAT]: {
          title: SCHEMA_FIELDS_TITLES[CLOCK_FORMAT],
          type: 'number',
          enum: [12, 24],
          enumNames: ['12-hour clock format', '24-hour clock format'],
          default: 12
        },
      },
      required: [CLOCK_FORMAT]
    }
  }
};

const uiSchema = {
  [getPageSectionKey(0, 0)]: {
    classNames: 'column-span-12 grid-container',
    [CLOCK_FORMAT]: {
      classNames: 'column-span-12',
    },
  }
};

export {
  schema,
  uiSchema
};
