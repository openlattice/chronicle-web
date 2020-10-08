// @flow

import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import * as FollowupSchema from './FollowupSchema';
import * as SecondaryActivitySchema from './SecondaryActivitySchema';

import SCHEMA_FIELDS_TITLES from '../constants/SchemaFieldsTitles';
import { ACTIVITY_NAMES } from '../constants/ActivitiesConstants';
import {
  ADULT_MEDIA_PURPOSES,
  ADULT_MEDIA_USAGE_OPTIONS,
  BG_MEDIA_PROPORTION_OPTIONS,
  CAREGIVERS,
  LOCATION_CATEGORIES,
  PROPERTY_CONSTS,
} from '../constants/SchemaConstants';

const { getPageSectionKey } = DataProcessingUtils;
const {
  ACTIVITY_END_TIME,
  ACTIVITY_NAME,
  ACTIVITY_START_TIME,
  ADULT_MEDIA,
  ADULT_MEDIA_PROPORTION,
  ADULT_MEDIA_PURPOSE,
  BG_AUDIO,
  BG_AUDIO_TYPE,
  BG_MEDIA_PROPORTION,
  BG_TV,
  BG_TV_AGE,
  BOOK_TITLE,
  BOOK_TYPE,
  CAREGIVER,
  DEVICE,
  FOLLOWUP_COMPLETED,
  LOCATION,
  MEDIA_ACTIVITY,
  MEDIA_AGE,
  MEDIA_NAME,
  OTHER_ACTIVITY,
  SECONDARY_ACTIVITY,
} = PROPERTY_CONSTS;
const { MEDIA_USE, NAPPING, READING } = ACTIVITY_NAMES;

const getBgAudioSchema = (selectedActivity :string) => ({
  properties: {
    [BG_AUDIO]: {
      title: 'Was there audio entertainment (e.g., music, talk radio) on in the background while your child'
        + ` was ${selectedActivity}?`,
      type: 'string',
      enum: ['Yes', 'No', "Don't Know"]
    },
    [ADULT_MEDIA]: {
      type: 'string',
      title: 'Was an adult using a tablet, laptop, or cell/smart phone at any point'
        + ` while your child was ${selectedActivity}?`,
      enum: ['Yes', 'No', "Don't Know"]
    }
  },
  required: [BG_AUDIO, ADULT_MEDIA],
  dependencies: {
    [ADULT_MEDIA]: {
      oneOf: [
        {
          properties: {
            [ADULT_MEDIA]: {
              enum: ['No', "Don't Know"]
            }
          },
        },
        {
          properties: {
            [ADULT_MEDIA]: {
              enum: ['Yes']
            },
            [ADULT_MEDIA_PURPOSE]: {
              type: 'array',
              title: SCHEMA_FIELDS_TITLES[ADULT_MEDIA_PURPOSE],
              description: 'Please choose all that apply',
              items: {
                type: 'string',
                enum: ADULT_MEDIA_PURPOSES
              },
              uniqueItems: true,
              minItems: 1
            },
            [ADULT_MEDIA_PROPORTION]: {
              type: 'string',
              title: 'Approximately what proportion of the time for this activity'
                + ` (${selectedActivity}) was the adult using their device?`,
              enum: ADULT_MEDIA_USAGE_OPTIONS
            },
          },
          required: [ADULT_MEDIA_PURPOSE, ADULT_MEDIA_PROPORTION]
        },
      ]
    },
    [BG_AUDIO]: {
      oneOf: [
        {
          properties: {
            [BG_AUDIO]: {
              enum: ['No', "Don't Know"]
            }
          },
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
            ...(selectedActivity === NAPPING) && {
              [BG_MEDIA_PROPORTION]: {
                type: 'string',
                title: 'Approximately'
                  + ' what proportion of time that the child was napping was the background media in use?',
                enum: BG_MEDIA_PROPORTION_OPTIONS
              }
            }
          },
          required: [BG_AUDIO_TYPE, BG_MEDIA_PROPORTION]
        }
      ]
    }
  }
});

const getFollowupUiOrder = (activity :string) => {
  switch (activity) {
    case READING: {
      return [BOOK_TYPE, BOOK_TITLE];
    }

    case MEDIA_USE: {
      return [DEVICE, MEDIA_ACTIVITY, MEDIA_AGE, MEDIA_NAME];
    }
    default:
      return [];
  }
};

const createSchema = (pageNum :number, selectedActivity :string, prevStartTime :DateTime, prevEndTime :DateTime) => {

  const followupSchema = FollowupSchema.createSchema(selectedActivity);
  const secondaryActivitySchema = SecondaryActivitySchema.createSchema(selectedActivity);
  const bgAudioSchema = getBgAudioSchema(selectedActivity);

  return {
    type: 'object',
    title: '',
    properties: {
      [getPageSectionKey(pageNum, 0)]: {
        type: 'object',
        title: '',
        properties: {
          [FOLLOWUP_COMPLETED]: {
            type: 'boolean',
            default: true
          },
          [ACTIVITY_NAME]: {
            type: 'string',
            default: selectedActivity
          },
          [ACTIVITY_START_TIME]: {
            type: 'string',
            default: prevStartTime.toLocaleString(DateTime.TIME_24_SIMPLE)
          },
          [ACTIVITY_END_TIME]: {
            type: 'string',
            default: prevEndTime.toLocaleString(DateTime.TIME_24_SIMPLE)
          },
          [LOCATION]: {
            type: 'string',
            title: `Where was your child when he/she was ${selectedActivity}?`,
            enum: LOCATION_CATEGORIES
          },
          [CAREGIVER]: {
            type: 'array',
            title: `Who was with your child when he/she was ${selectedActivity}?`,
            description: 'Please choose all that apply',
            items: {
              type: 'string',
              enum: CAREGIVERS
            },
            uniqueItems: true,
            minItems: 1
          },
          ...followupSchema.properties,
          ...secondaryActivitySchema.properties,
          [BG_TV]: {
            type: 'string',
            title: `Was there a TV on in the background while your child was ${selectedActivity}?`,
            enum: ['Yes', 'No', "Don't Know"]
          },
          ...bgAudioSchema.properties
        },
        required: [LOCATION, CAREGIVER, BG_TV,
          ...bgAudioSchema.required,
          ...followupSchema.required,
          ...secondaryActivitySchema.required],
        dependencies: {
          [BG_TV]: {
            oneOf: [
              {
                properties: {
                  [BG_TV]: {
                    enum: ['No', "Don't Know"]
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
                      enum: ["Child's age", 'Older children', 'Younger children', 'Adults', 'Don`t know'],
                    },
                    uniqueItems: true
                  },
                  ...(selectedActivity === NAPPING) && {
                    [BG_MEDIA_PROPORTION]: {
                      type: 'string',
                      title: 'Approximately'
                        + ' what proportion of time that the child was napping was the background media in use?',
                      enum: BG_MEDIA_PROPORTION_OPTIONS
                    }
                  }
                },
                required: [BG_TV_AGE, BG_MEDIA_PROPORTION],
              }
            ]
          },
          ...secondaryActivitySchema.dependencies,
          ...bgAudioSchema.dependencies,
        },
      }
    },

  };
};

const createUiSchema = (pageNum :number, selectedActivity :string) => {
  const followupUiOrder :string[] = getFollowupUiOrder(selectedActivity);
  const followUpFields = [BOOK_TYPE, BOOK_TITLE, DEVICE, MEDIA_ACTIVITY, MEDIA_AGE, MEDIA_NAME];

  const otherFollowupOrder = followUpFields.filter((field) => !followupUiOrder.includes(field));
  return {
    [getPageSectionKey(pageNum, 0)]: {
      classNames: 'column-span-12 grid-container',
      'ui:order': [FOLLOWUP_COMPLETED, ACTIVITY_NAME, ACTIVITY_START_TIME, ACTIVITY_END_TIME,
        LOCATION, CAREGIVER, ...followupUiOrder,
        OTHER_ACTIVITY, SECONDARY_ACTIVITY, ...otherFollowupOrder, BG_TV, BG_TV_AGE,
        BG_AUDIO, BG_AUDIO_TYPE, BG_MEDIA_PROPORTION, ADULT_MEDIA, ADULT_MEDIA_PURPOSE, ADULT_MEDIA_PROPORTION],

      [FOLLOWUP_COMPLETED]: {
        classNames: 'hidden'
      },
      [ACTIVITY_NAME]: {
        classNames: 'hidden',
      },
      [ACTIVITY_START_TIME]: {
        classNames: 'hidden'
      },
      [ACTIVITY_END_TIME]: {
        classNames: 'hidden'
      },
      [BG_AUDIO]: {
        classNames: 'column-span-12',
        'ui:widget': 'radio'
      },
      [BG_TV]: {
        classNames: 'column-span-12',
        'ui:widget': 'radio'
      },
      [BG_TV_AGE]: {
        classNames: 'column-span-12',
        'ui:widget': 'OtherRadioWidget',
      },
      [BG_MEDIA_PROPORTION]: {
        classNames: 'column-span-12',
        'ui:widget': 'radio'
      },
      [ADULT_MEDIA]: {
        classNames: 'column-span-12',
        'ui:widget': 'radio'
      },
      [LOCATION]: {
        classNames: 'column-span-12',
        'ui:widget': 'radio'
      },
      [OTHER_ACTIVITY]: {
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
      [BOOK_TYPE]: {
        classNames: 'column-span-12',
        'ui:widget': 'checkboxes',
        'ui:options': {
          withOther: 'true'
        }
      },
      [BOOK_TITLE]: {
        classNames: 'column-span-12'
      },
      [BG_AUDIO_TYPE]: {
        classNames: 'column-span-12',
        'ui:widget': 'OtherRadioWidget'
      },
      [ADULT_MEDIA_PROPORTION]: {
        classNames: 'column-span-12',
        'ui:widget': 'radio'
      },
      [ADULT_MEDIA_PURPOSE]: {
        classNames: 'column-span-12',
        'ui:widget': 'checkboxes',
        'ui:options': {
          withNone: true,
          noneText: "Don't know",
          withOther: true
        }
      },
      ...FollowupSchema.uiSchema,
      ...SecondaryActivitySchema.uiSchema
    }
  };

};

export {
  createSchema,
  createUiSchema,
};
