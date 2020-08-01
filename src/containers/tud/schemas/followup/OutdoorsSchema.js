// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import { PROPERTY_CONSTS, CAREGIVERS, SECONDARY_LOCATIONS } from '../../constants/SchemaConstants';

const {
  SECONDARY_LOCATION,
  MEDIA,
  CAREGIVER,
  MEDIA_AGE,
  BG_AUDIO,
  ADULT_MEDIA,
  ADULT_MEDIA_PURPOSE
} = PROPERTY_CONSTS;

const { getPageSectionKey } = DataProcessingUtils;

const adultMediaSchema = {
  properties: {
    [ADULT_MEDIA]: {
      type: 'string',
      title: `Was an adult using a tablet, laptop, cell phone/smart phone
        at any point while your child did this activity?`,
      enum: ['Yes', 'No', "Don't Know"]
    },
  },
  dependencies: {
    [ADULT_MEDIA]: {
      oneOf: [
        {
          properties: {
            [ADULT_MEDIA]: {
              enum: ['Yes']
            },
            [ADULT_MEDIA_PURPOSE]: {
              type: 'array',
              title: 'What was the tablet/laptop/cell phone/smart phone used for? Please choose all that apply',
              items: {
                type: 'string',
                enum: ['Work call', 'Work email', 'Review of documents for work',
                  'Social call', 'Entertainment', 'Social media']
              },
              uniqueItems: true,
              minItems: 1
            },
          }
        },
        {
          properties: {
            [ADULT_MEDIA]: {
              enum: ['No', "Don't Know"]
            },
          }
        }
      ]
    }
  }
};

const createSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 1)]: {
    type: 'object',
    title: '',
    properties: {
      [CAREGIVER]: {
        type: 'array',
        title: 'Who was with your child when he/she was doing this? Please choose all that apply.',
        items: {
          type: 'string',
          enum: CAREGIVERS
        },
        uniqueItems: true,
        minItems: 1
      },
      [SECONDARY_LOCATION]: {
        type: 'string',
        title: 'Where was your child when he/she was doing this activity?',
        enum: SECONDARY_LOCATIONS
      },
      [MEDIA]: {
        type: 'string',
        title: `Was media being used at the same time as this activity, such as
            television, movies, video or computer games,
            books, magazines, radio or CDs, cell phone/smart phone, laptop or a tablet?`,
        enum: ['Yes', 'No', "Don't Know"]
      }
    },
    dependencies: {
      [MEDIA]: {
        oneOf: [
          {
            properties: {
              [MEDIA]: {
                enum: ['Yes']
              },
              [MEDIA_AGE]: { // TODO: otherText radio
                type: 'array',
                title: `Was the media content directed at your child's age,
                  older children, younger children, or adults?`,
                items: {
                  type: 'string',
                  enum: ["Child's age", 'Older children', 'Younger children', 'Adults']
                },
                uniqueItems: true
              },
              [BG_AUDIO]: {
                title: `Was there audio entertainment (e.g., music, talk radio)
                on in the background while your child was doing this activity?`,
                type: 'string',
                enum: ['Yes', 'No', "Don't Know"]
              },
              ...adultMediaSchema.properties
            },
            dependencies: {
              ...adultMediaSchema.dependencies
            }
          },
          {
            properties: {
              [MEDIA]: {
                enum: ['No', "Don't Know"]
              },
              ...adultMediaSchema.properties
            },
            dependencies: {
              ...adultMediaSchema.dependencies
            }
          }
        ]
      }
    }
  }
});

const createUiSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 1)]: {
    classNames: 'column-span-12 grid-container',
    [MEDIA]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [MEDIA_AGE]: {
      classNames: 'column-span-12',
      'ui:widget': 'OtherRadioWidget'
    },
    [SECONDARY_LOCATION]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [CAREGIVER]: {
      classNames: 'column-span-12',
      'ui:widget': 'checkboxes',
      'ui:options': {
        withNone: true,
        noneText: 'No one'
      }
    },
    [BG_AUDIO]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [ADULT_MEDIA]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [ADULT_MEDIA_PURPOSE]: {
      classNames: 'column-span-12',
      'ui:widget': 'checkboxes',
      'ui:options': {
        withNone: true,
        noneText: "Don't know"
      }
    },
  }
});

export {
  createSchema,
  createUiSchema
};
