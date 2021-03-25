// @flow

import * as SecondaryFollowUpSchema from './SecondaryFollowUpSchema';

import TranslationKeys from '../constants/TranslationKeys';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

const { OTHER_ACTIVITY, SECONDARY_ACTIVITY } = PROPERTY_CONSTS;

const createSchema = (primaryActivity :string, trans :(string, ?Object) => Object) => {

  // $FlowFixMe
  const activitiesList :string[] = Object.values(trans(TranslationKeys.PRIMARY_ACTIVITIES, { returnObjects: true }));

  const secondaryActivityOptions :string[] = activitiesList.filter((activity :string) => activity !== primaryActivity);

  return {
    properties: {
      [OTHER_ACTIVITY]: {
        type: 'string',
        title: trans(TranslationKeys.OTHER_ACTIVITY, {
          activity: primaryActivity,
          interpolation: { escapeValue: false }
        }),
        enum: [trans(TranslationKeys.YES), trans(TranslationKeys.NO), trans(TranslationKeys.DONT_KNOW)]
      }
    },
    required: [OTHER_ACTIVITY],
    dependencies: {
      [OTHER_ACTIVITY]: {
        oneOf: [
          {
            properties: {
              [OTHER_ACTIVITY]: {
                enum: [trans(TranslationKeys.NO), trans(TranslationKeys.DONT_KNOW)]
              },
            }
          },
          {
            properties: {
              [OTHER_ACTIVITY]: {
                enum: [trans(TranslationKeys.YES)]
              },
              [SECONDARY_ACTIVITY]: {
                title: trans(TranslationKeys.SECONDARY_ACTIVITY, {
                  activity: primaryActivity,
                  interpolation: { escapeValue: false }
                }),
                description: trans(TranslationKeys.CHOOSE_APPLICABLE),
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

const createUiSchema = (trans :(string, ?Object) => Object) => ({
  [SECONDARY_ACTIVITY]: {
    classNames: 'column-span-12',
    'ui:widget': 'checkboxes'
  },
  [OTHER_ACTIVITY]: {
    classNames: 'column-span-12',
    'ui:widget': 'radio'
  },
  ...SecondaryFollowUpSchema.createUiSchema(trans)
});

export {
  createSchema,
  createUiSchema
};
