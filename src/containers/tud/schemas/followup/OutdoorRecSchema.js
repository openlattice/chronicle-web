// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import { PROPERTY_CONSTS, CAREGIVERS } from '../../constants/SchemaConstants';

const {
  CAREGIVER,
  MEDIA,
  BG_AUDIO,
  ADULT_MEDIA
} = PROPERTY_CONSTS;

const { getPageSectionKey } = DataProcessingUtils;

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
      [MEDIA]: {
        type: 'string',
        title: 'Was media being used at the same time as this activity, such as '
            + 'television, movies, video or computer games, '
            + 'books, magazines, radio or CDs, cell phone/smart phone, laptop or a tablet?',
        enum: ['Yes', 'No', "Don't Know"]
      }
    },
    required: [CAREGIVER, MEDIA],
    dependencies: {
      [MEDIA]: {
        oneOf: [
          {
            properties: {
              [MEDIA]: {
                enum: ['Yes']
              },
              [BG_AUDIO]: {
                title: 'Was there audio entertainment (e.g., music, talk radio) '
                    + 'on in the background while your child was doing this activity?',
                type: 'string',
                enum: ['Yes', 'No', "Don't Know"]
              },
              [ADULT_MEDIA]: {
                type: 'string',
                title: 'Was an adult using a tablet, laptop, cell phone/smart phone '
                    + 'at any point while your child did this activity?',
                enum: ['Yes', 'No', "Don't Know"]
              }
            },
            required: [BG_AUDIO, ADULT_MEDIA]
          },
          {
            properties: {
              [MEDIA]: {
                enum: ['No', "Don't Know"]
              },
              [ADULT_MEDIA]: {
                type: 'string',
                title: 'Was an adult using a tablet, laptop, cell phone/smart '
                    + 'phone at any point while your child did this activity?',
                enum: ['Yes', 'No', "Don't Know"]
              }
            },
            required: [ADULT_MEDIA]
          }
        ]
      }
    }
  }
});

const createUiSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 1)]: {
    classNames: 'column-span-12 grid-container'
  },
  [CAREGIVER]: {
    classNames: 'column-span-12',
    'ui:widget': 'checkboxes',
    'ui:options': {
      withNone: true,
      noneText: 'No one'
    }
  },
  [ADULT_MEDIA]: {
    classNames: 'column-span-12',
    'ui:widget': 'radio',
  },
  [MEDIA]: {
    classNames: 'column-span-12',
    'ui:widget': 'radio',
  },
  [BG_AUDIO]: {
    classNames: 'column-span-12',
    'ui:widget': 'radio',
  }
});

export {
  createSchema,
  createUiSchema
};
