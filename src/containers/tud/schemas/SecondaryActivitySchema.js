// @flow

import * as FollowupSchema from './FollowupSchema';

import { ACTIVITY_NAMES, SECONDARY_ACTIVITIES } from '../constants/ActivitiesConstants';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

const {
  OTHER_ACTIVITY,
  SECONDARY_ACTIVITY,
} = PROPERTY_CONSTS;

const {
  READING,
  MEDIA_USE,
} = ACTIVITY_NAMES;

const createSchema = (primaryActivity :string) => {
  const secondaryActivityOptions :string[] = SECONDARY_ACTIVITIES
    .filter((activity :string) => activity !== primaryActivity);

  const readingSchema = FollowupSchema.createSchema(READING);
  const mediaUseSchema = FollowupSchema.createSchema(MEDIA_USE);

  const arr = [READING, MEDIA_USE];
  const activitiesWithoutFollowup :string[] = SECONDARY_ACTIVITIES
    .filter((activity :string) => !arr.includes(activity));

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
                title: `Ok, what else did your child do while ${primaryActivity}`,
                enum: secondaryActivityOptions
              }
            },
            required: [SECONDARY_ACTIVITY],
            dependencies: {
              [SECONDARY_ACTIVITY]: {
                oneOf: [
                  {
                    properties: {
                      [SECONDARY_ACTIVITY]: {
                        enum: activitiesWithoutFollowup
                      }
                    }
                  },
                  {
                    properties: {
                      [SECONDARY_ACTIVITY]: {
                        enum: [READING]
                      },
                      ...readingSchema.properties
                    },
                    required: readingSchema.required
                  },
                  {
                    properties: {
                      [SECONDARY_ACTIVITY]: {
                        enum: [MEDIA_USE]
                      },
                      ...mediaUseSchema.properties
                    },
                    required: mediaUseSchema.required
                  }
                ]
              }
            }
          }
        ]
      }
    },
  };
};

const uiSchema = {
  [SECONDARY_ACTIVITY]: {
    classNames: 'column-span-12',
    'ui:widget': 'radio'
  },
  [OTHER_ACTIVITY]: {
    classNames: 'column-span-12',
    'ui:widget': 'radio'
  },
  ...FollowupSchema.uiSchema
};

/* eslint-disable import/prefer-default-export */
export {
  createSchema,
  uiSchema
};
/* eslint-enable */
