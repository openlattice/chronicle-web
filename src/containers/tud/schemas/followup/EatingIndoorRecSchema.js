// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import { PROPERTY_CONSTS, LOCATION_CATEGORIES, CAREGIVERS } from '../../constants/SchemaConstants';

const {
  ADULT_MEDIA,
  BG_AUDIO,
  BG_AUDIO_TYPE,
  BG_TV,
  BG_TV_AGE,
  CAREGIVER,
  LOCATION,
  MEDIA,
} = PROPERTY_CONSTS;

const { getPageSectionKey } = DataProcessingUtils;

const bgAudioSchema = {
  properties: {
    [BG_AUDIO]: {
      title: `Was there audio entertainment (e.g., music, talk radio)
      on in the background while your child was doing this activity?`,
      type: 'string',
      enum: ['Yes', 'No', "Don't Know"]
    }
  },
  dependencies: {
    [BG_AUDIO]: {
      oneOf: [
        {
          properties: {
            [BG_AUDIO]: {
              enum: ['No', "Don't Know"]
            },
            [ADULT_MEDIA]: {
              type: 'string',
              title: `Was an adult using a tablet, laptop, cell phone/smart
                phone at any point while your child did this activity?`,
              enum: ['Yes', 'No', "Don't Know"]
            }
          }
        },
        {
          properties: {
            [BG_AUDIO]: {
              enum: ['Yes']
            },
            [BG_AUDIO_TYPE]: {
              title: 'What kind of audio was in the background',
              type: 'array',
              items: {
                type: 'string',
                enum: ['Music', 'Talk Radio', 'Podcast', "Don't Know"]
              },
              uniqueItems: true
            },
            [ADULT_MEDIA]: {
              type: 'string',
              title: `Was an adult using a tablet, laptop, cell phone/smart
                phone at any point while your child did this activity?`,
              enum: ['Yes', 'No', "Don't Know"]
            }
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
      [LOCATION]: {
        type: 'string',
        title: 'Where was your child when he/she was doing this activity?',
        enum: LOCATION_CATEGORIES
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
                enum: ['No', "Don't Know"]
              },
              [ADULT_MEDIA]: {
                type: 'string',
                title: `Was an adult using a tablet, laptop, cell phone/smart
                  phone at any point while your child did this activity?`,
                enum: ['Yes', 'No', "Don't Know"]
              }
            }
          },
          {
            properties: {
              [MEDIA]: {
                enum: ['Yes']
              },
              [BG_TV]: {
                type: 'string',
                title: 'Was there a TV on in the background while your child did this activity?',
                enum: ['Yes', 'No', "Don't Know"]
              }
            },
            dependencies: {
              [BG_TV]: {
                oneOf: [
                  {
                    properties: {
                      [BG_TV]: {
                        enum: ['No', "Don't Know"]
                      },
                      ...bgAudioSchema.properties
                    },
                    dependencies: {
                      ...bgAudioSchema.dependencies
                    }
                  },
                  {
                    properties: {
                      [BG_TV]: {
                        enum: ['Yes']
                      },
                      // TODO: add otherText option to radio widget
                      [BG_TV_AGE]: {
                        title: `Was the program for your child's age, for older children,
                        for younger children, or for adults?`,
                        type: 'string',
                        enum: ["Child's age", 'Older children', 'Younger children', 'Adults', "Don't know/other"],
                      },
                      ...bgAudioSchema.properties
                    },
                    dependencies: {
                      ...bgAudioSchema.dependencies
                    }
                  }
                ]
              }
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
    [CAREGIVER]: {
      classNames: 'column-span-12',
      'ui:widget': 'checkboxes',
      'ui:options': {
        withNone: true,
        noneText: 'No one'
      }
    },
    [LOCATION]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [ADULT_MEDIA]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [MEDIA]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [BG_AUDIO]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [BG_AUDIO_TYPE]: {
      classNames: 'column-span-12',
      'ui:widget': 'OtherRadioWidget'
    },
    [BG_TV_AGE]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio', // otherText
    },
    [BG_TV]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    }
  }
});

export {
  createSchema,
  createUiSchema
};
