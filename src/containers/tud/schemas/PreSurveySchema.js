// @flow

import { DataProcessingUtils } from 'lattice-fabricate';
import { Info } from 'luxon';

import { NON_TYPICAL_DAY_REASONS, SCHEMA_CONSTANTS } from '../constants';

const { getPageSectionKey } = DataProcessingUtils;
const {
  DAYS_OF_WEEK,
  NON_TYPICAL_DAY_REASON,
  TYPICAL_DAY_FLAG
} = SCHEMA_CONSTANTS;

const schema = {
  type: 'object',
  title: '',
  properties: {
    [getPageSectionKey(0, 0)]: {
      type: 'object',
      title: '',
      properties: {
        [DAYS_OF_WEEK]: {
          title: `We would like you to think about your child's day and complete the time use diary for yesterday.
            What day of the week was yesterday?`,
          // $FlowFixMe
          enum: Info.weekdays(),
          type: 'string'
        },
        [TYPICAL_DAY_FLAG]: {
          title: `An important part of this project is to find out how children spend their time
          during the week. Was yesterday a typical weekday for you and your child?
          A non-typical day would include a school closing, being on vacation, or being home sick.`,
          type: 'boolean',
          enum: [true, false],
          enumNames: ['Yes', 'No']
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
                  title: 'What made yesterday a non-typical day?',
                  type: 'string',
                  enum: NON_TYPICAL_DAY_REASONS
                }
              },
              required: [NON_TYPICAL_DAY_REASON]
            }
          ]
        }
      },
      required: [DAYS_OF_WEEK, TYPICAL_DAY_FLAG]
    }
  }
};

const uiSchema = {
  [getPageSectionKey(0, 0)]: {
    classNames: 'column-span-12 grid-container',
    [DAYS_OF_WEEK]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio',
    },
    [TYPICAL_DAY_FLAG]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [NON_TYPICAL_DAY_REASON]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    }
  }
};

export {
  schema,
  uiSchema
};
