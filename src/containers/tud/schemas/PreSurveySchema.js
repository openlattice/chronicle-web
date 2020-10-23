// @flow

import { DataProcessingUtils } from 'lattice-fabricate';
import { Info } from 'luxon';

import SCHEMA_FIELDS_TITLES from '../constants/SchemaFieldsTitles';
import { NON_TYPICAL_DAY_REASONS, PROPERTY_CONSTS } from '../constants/SchemaConstants';

const { getPageSectionKey } = DataProcessingUtils;
const {
  DAY_OF_WEEK,
  NON_TYPICAL_DAY_REASON,
  TYPICAL_DAY_FLAG
} = PROPERTY_CONSTS;

const schema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(0, 0)]: {
      type: 'object',
      title: '',
      properties: {
        [DAY_OF_WEEK]: {
          title: SCHEMA_FIELDS_TITLES[DAY_OF_WEEK],
          // $FlowFixMe
          enum: Info.weekdays(),
          type: 'string'
        },
        [TYPICAL_DAY_FLAG]: {
          title: SCHEMA_FIELDS_TITLES[TYPICAL_DAY_FLAG],
          type: 'boolean',
          enum: [true, false],
          enumNames: ['Yes, yesterday was typical.', 'No, yesterday was non-typical.']
        }
      },
      dependencies: {
        [TYPICAL_DAY_FLAG]: {
          oneOf: [
            {
              properties: {
                [TYPICAL_DAY_FLAG]: {
                  enum: [true]
                }
              }
            },
            {
              properties: {
                [TYPICAL_DAY_FLAG]: {
                  enum: [false]
                },
                [NON_TYPICAL_DAY_REASON]: {
                  title: SCHEMA_FIELDS_TITLES[NON_TYPICAL_DAY_REASON],
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: NON_TYPICAL_DAY_REASONS
                  },
                  uniqueItems: true,
                  minItems: 1
                }
              },
              required: [NON_TYPICAL_DAY_REASON]
            }
          ]
        }
      },
      required: [DAY_OF_WEEK, TYPICAL_DAY_FLAG]
    }
  }
};

const uiSchema = {
  [getPageSectionKey(0, 0)]: {
    classNames: 'column-span-12 grid-container',
    [DAY_OF_WEEK]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio',
    },
    [TYPICAL_DAY_FLAG]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [NON_TYPICAL_DAY_REASON]: {
      classNames: 'column-span-12',
      'ui:widget': 'OtherRadioWidget'
    }
  }
};

export {
  schema,
  uiSchema
};
