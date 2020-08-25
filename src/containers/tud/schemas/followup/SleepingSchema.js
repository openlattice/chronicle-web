// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import SCHEMA_FIELDS_TITLES from '../../constants/SchemaFieldsTitles';
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
      title: SCHEMA_FIELDS_TITLES[BG_AUDIO_TYPE],
      type: 'array',
      items: {
        type: 'string',
        enum: ['Music', 'Talk Radio', 'Podcast', "Don't Know"]
      },
      uniqueItems: true
    },
    [BG_MEDIA_PROPORTION]: {
      title: SCHEMA_FIELDS_TITLES[BG_MEDIA_PROPORTION],
      type: 'number',
      minimum: 0,
      maximum: 100
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
        title: SCHEMA_FIELDS_TITLES[MEDIA],
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
                title: SCHEMA_FIELDS_TITLES[BG_TV],
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
                        title: SCHEMA_FIELDS_TITLES[BG_AUDIO],
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
                        title: SCHEMA_FIELDS_TITLES[BG_TV_AGE],
                        type: 'array',
                        items: {
                          type: 'string',
                          enum: ["Child's age", 'Older children', 'Younger children', 'Adults'],
                        },
                        uniqueItems: true
                      },
                      [BG_AUDIO]: {
                        title: SCHEMA_FIELDS_TITLES[BG_AUDIO],
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
                                title: SCHEMA_FIELDS_TITLES[BG_MEDIA_PROPORTION],
                                type: 'number',
                                minimum: 0,
                                maximum: 100
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
      'ui:widget': 'OtherRadioWidget',
      'ui:options': {
        otherText: 'Don\'t know/other'
      }
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
