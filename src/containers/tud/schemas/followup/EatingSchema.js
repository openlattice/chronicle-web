// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import { EATING_ACTIVITY_CONSTS } from '../../constants/SchemaConstants';

const {
  ADULT_MEDIA,
  BG_AUDIO,
  BG_AUDIO_TYPE,
  BG_TV,
  BG_TV_AGE,
  CAREGIVER,
  LOCATION,
  MEDIA,
} = EATING_ACTIVITY_CONSTS;

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
          enum: ['Mother/Mother figure', 'Father/Father figure',
            'Grandparent', 'Sibling', 'Other relative', 'Childcare provider/nanny/babysitter', 'Other kids']
        },
        uniqueItems: true,
        minItems: 1
      },
      [LOCATION]: {
        type: 'string',
        title: 'Where was your child when he/she was doing this activity?',
        enum: ['Room where child sleeps', 'In some other room in the house (e.g. kitchen, family room)',
          'Outdoors (e.g. park or yard)', 'At school or daycare', 'While travelling (e.g. car, train, or school bus)',
          'Restaurant, grocery store, or shopping center',
          'Multiple locations', 'Other (e.g. another person\'s house, church)']
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
                                type: 'string',
                                enum: ['Music', 'Talk Radio', 'Podcast', "Don't Know"]
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
                                type: 'string',
                                enum: ['Music', 'Talk Radio', 'Podcast']
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
