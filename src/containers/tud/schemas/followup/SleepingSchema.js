// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import { PROPERTY_CONSTS } from '../../constants/SchemaConstants';

const { getPageSectionKey } = DataProcessingUtils;

const {
  MEDIA,
  BG_TV,
  BG_TV_AGE,
  BG_AUDIO,
  BG_AUDIO_TYPE,
  BG_MEDIA_PROPORTION
} = PROPERTY_CONSTS;

const bgAudioSchema = {
  properties: {
    [BG_AUDIO_TYPE]: {
      title: 'What kind of audio was in the background',
      type: 'array',
      items: {
        type: 'string',
        enum: ['Music', 'Talk Radio', 'Podcast', "Don't Know"]
      },
      uniqueItems: true
    },
    [BG_MEDIA_PROPORTION]: {
      title: `Approximately what percentage of time that the child was
      sleeping was the background media in use?
      For example, if your child slept for 10 hours and the radio was on for 1,
       enter 10; if on the full time, enter 100.`,
      type: 'number',
    },
  },
  required: [BG_AUDIO_TYPE, BG_MEDIA_PROPORTION]
};

const createSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 1)]: {
    type: 'object',
    title: '',
    properties: {
      [MEDIA]: {
        title: `Was media being used in the same room as the child while they were sleeping?
          This could include television, movies, video or computer games, radio or CDs,
          but does not include white noise machines. `,
        type: 'string',
        enum: ['Yes', 'No', "Don't Know"]
      },
    },
    required: [MEDIA],
    dependencies: {
      [MEDIA]: {
        oneOf: [
          {
            properties: {
              [MEDIA]: {
                enum: ['No', "Don't Know"]
              }
            }
          },
          {
            properties: {
              [MEDIA]: {
                enum: ['Yes']
              },
              [BG_TV]: {
                title: 'Was there a TV on in the background while your child did this activity?',
                type: 'string',
                enum: ['Yes', 'No', "Don't Know"]
              }
            },
            required: [BG_TV],
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
                    required: [BG_AUDIO],
                    dependencies: {
                      [BG_AUDIO]: {
                        oneOf: [
                          {
                            properties: {
                              [BG_AUDIO]: {
                                enum: ['No', "Don't Know"]
                              }
                            }
                          },
                          {
                            properties: {
                              [BG_AUDIO]: {
                                enum: ['Yes']
                              },
                              ...bgAudioSchema.properties
                            },
                            required: bgAudioSchema.required
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
                      [BG_TV_AGE]: {
                        title: `Was the program for your child's age, for older children,
                        for younger children, or for adults?`,
                        type: 'array',
                        items: {
                          type: 'string',
                          enum: ["Child's age", 'Older children', 'Younger children', 'Adults'],
                        },
                        uniqueItems: true
                      },
                      [BG_AUDIO]: {
                        title: `Was there audio entertainment (e.g., music, talk radio)
                        on in the background while your child was doing this activity?`,
                        type: 'string',
                        enum: ['Yes', 'No', "Don't Know"]
                      }
                    },
                    required: [BG_AUDIO, BG_TV_AGE],
                    dependencies: {
                      [BG_AUDIO]: {
                        oneOf: [
                          {
                            properties: {
                              [BG_AUDIO]: {
                                enum: ['No', "Don't Know"]
                              },
                              [BG_MEDIA_PROPORTION]: {
                                title: `Approximately what percentage of time that the child was
                                sleeping was the background media in use?
                                For example, if your child slept for 10 hours and the radio was on for 1,
                                 enter 10; if on the full time, enter 100.`,
                                type: 'number',
                              }
                            },
                            required: [BG_MEDIA_PROPORTION]
                          },
                          {
                            properties: {
                              [BG_AUDIO]: {
                                enum: ['Yes']
                              },
                              ...bgAudioSchema.properties
                            },
                            required: bgAudioSchema.required
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
    [MEDIA]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [BG_TV]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [BG_AUDIO]: {
      classNames: 'column-span-12',
      'ui:widget': 'radio'
    },
    [BG_TV_AGE]: {
      classNames: 'column-span-12',
      'ui:widget': 'OtherRadioWidget'
    },
    [BG_MEDIA_PROPORTION]: {
      classNames: 'column-span-12',
    },
    [BG_AUDIO_TYPE]: {
      classNames: 'column-span-12',
      'ui:widget': 'OtherRadioWidget'
    }
  }
});

export {
  createUiSchema,
  createSchema
};
