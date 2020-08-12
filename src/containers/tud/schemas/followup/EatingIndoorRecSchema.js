// @flow

import { DataProcessingUtils } from 'lattice-fabricate';

import SCHEMA_FIELDS_TITLES from '../../constants/SchemaFieldsTitles';
import { CAREGIVERS, LOCATION_CATEGORIES, PROPERTY_CONSTS } from '../../constants/SchemaConstants';

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
            },
            [ADULT_MEDIA]: {
              type: 'string',
              title: SCHEMA_FIELDS_TITLES[ADULT_MEDIA],
              enum: ['Yes', 'No', "Don't Know"]
            }
          },
          required: [ADULT_MEDIA]
        },
        {
          properties: {
            [BG_AUDIO]: {
              enum: ['Yes']
            },
            [BG_AUDIO_TYPE]: {
              title: SCHEMA_FIELDS_TITLES[BG_AUDIO_TYPE],
              type: 'array',
              items: {
                type: 'string',
                enum: ['Music', 'Talk Radio', 'Podcast', "Don't Know"]
              },
              uniqueItems: true
            },
            [ADULT_MEDIA]: {
              type: 'string',
              title: SCHEMA_FIELDS_TITLES[ADULT_MEDIA],
              enum: ['Yes', 'No', "Don't Know"]
            }
          },
          required: [ADULT_MEDIA, BG_AUDIO_TYPE]
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
        title: SCHEMA_FIELDS_TITLES[CAREGIVER],
        items: {
          type: 'string',
          enum: CAREGIVERS
        },
        uniqueItems: true,
        minItems: 1
      },
      [LOCATION]: {
        type: 'string',
        title: SCHEMA_FIELDS_TITLES[LOCATION],
        enum: LOCATION_CATEGORIES
      },
      [MEDIA]: {
        type: 'string',
        title: SCHEMA_FIELDS_TITLES[MEDIA],
        enum: ['Yes', 'No', "Don't Know"]
      }
    },
    required: [CAREGIVER, LOCATION, MEDIA],
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
                title: SCHEMA_FIELDS_TITLES[ADULT_MEDIA],
                enum: ['Yes', 'No', "Don't Know"]
              }
            },
            required: [ADULT_MEDIA]
          },
          {
            properties: {
              [MEDIA]: {
                enum: ['Yes']
              },
              [BG_TV]: {
                type: 'string',
                title: SCHEMA_FIELDS_TITLES[BG_TV],
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
                      ...bgAudioSchema.properties
                    },
                    required: bgAudioSchema.required,
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
                        title: SCHEMA_FIELDS_TITLES[BG_TV_AGE],
                        type: 'array',
                        items: {
                          type: 'string',
                          enum: ["Child's age", 'Older children', 'Younger children', 'Adults'],
                        },
                        uniqueItems: true
                      },
                      ...bgAudioSchema.properties
                    },
                    required: [BG_TV_AGE, ...bgAudioSchema.required],
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
      'ui:widget': 'OtherRadioWidget',
      'ui:options': {
        otherText: 'Don\'t know/other'
      }
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
