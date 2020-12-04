// @flow

import * as SecondaryFollowUpSchema from './SecondaryFollowUpSchema';

import { PRIMARY_ACTIVITIES, PROPERTY_CONSTS } from '../constants/SchemaConstants';

const { OTHER_ACTIVITY, SECONDARY_ACTIVITY } = PROPERTY_CONSTS;

// $FlowFixMe
const activitiesList :string[] = Object.values(PRIMARY_ACTIVITIES);

const createSchema = (primaryActivity :string) => {
  const secondaryActivityOptions :string[] = activitiesList.filter((activity :string) => activity !== primaryActivity);

  return {
    properties: {
      [OTHER_ACTIVITY]: {
        type: 'string',
        title: `Did your child do anything else while ${primaryActivity}?`,
        enum: ['Yes', 'No', 'Don\'t know']
      }
    },
    required: [OTHER_ACTIVITY],
    dependencies: {
      [OTHER_ACTIVITY]: {
        oneOf: [
          {
            properties: {
              [OTHER_ACTIVITY]: {
                enum: ['No', 'Don\'t know']
              },
            }
          },
          {
            properties: {
              [OTHER_ACTIVITY]: {
                enum: ['Yes']
              },
              [SECONDARY_ACTIVITY]: {
                title: `Ok, what else did your child do while ${primaryActivity}?`,
                description: 'Please choose all that apply.',
                type: 'array',
                items: {
                  enum: secondaryActivityOptions,
                  type: 'string'
                },
                uniqueItems: true,
                minItems: 1
              }
            },
            required: [SECONDARY_ACTIVITY],
          }
        ]
      }
    },
  };
};

const uiSchema = {
  [SECONDARY_ACTIVITY]: {
    classNames: 'column-span-12',
    'ui:widget': 'checkboxes'
  },
  [OTHER_ACTIVITY]: {
    classNames: 'column-span-12',
    'ui:widget': 'radio'
  },
  ...SecondaryFollowUpSchema.uiSchema
};

export {
  createSchema,
  uiSchema
};
