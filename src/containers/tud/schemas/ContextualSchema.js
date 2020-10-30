// @flow

import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import * as FollowupSchema from './FollowupSchema';
import * as SecondaryActivitySchema from './SecondaryActivitySchema';

import {
  BG_MEDIA_OPTIONS,
  CAREGIVERS,
  PRIMARY_ACTIVITIES,
  PROPERTY_CONSTS
} from '../constants/SchemaConstants';

const { getPageSectionKey } = DataProcessingUtils;
const {
  ACTIVITY_END_TIME,
  ACTIVITY_NAME,
  ACTIVITY_START_TIME,
  ADULT_MEDIA,
  BG_AUDIO_DAY,
  BG_TV_DAY,
  BOOK_TITLE,
  BOOK_TYPE,
  CAREGIVER,
  HAS_FOLLOWUP_QUESTIONS,
  SCREEN_MEDIA_ACTIVITY,
  SCREEN_MEDIA_AGE,
  SCREEN_MEDIA_NAME,
  OTHER_ACTIVITY,
  SECONDARY_ACTIVITY,
} = PROPERTY_CONSTS;
const { MEDIA_USE, READING } = PRIMARY_ACTIVITIES;

const getFollowupUiOrder = (activity :string) => {
  switch (activity) {
    case READING: {
      return [BOOK_TYPE, BOOK_TITLE];
    }

    case MEDIA_USE: {
      return [SCREEN_MEDIA_ACTIVITY, SCREEN_MEDIA_AGE, SCREEN_MEDIA_NAME];
    }
    default:
      return [];
  }
};

const createSchema = (pageNum :number, selectedActivity :string, prevStartTime :DateTime, prevEndTime :DateTime) => {

  const followupSchema = FollowupSchema.createSchema(selectedActivity);
  const secondaryActivitySchema = SecondaryActivitySchema.createSchema(selectedActivity);

  return {
    type: 'object',
    title: '',
    properties: {
      [getPageSectionKey(pageNum, 0)]: {
        type: 'object',
        title: '',
        properties: {
          [HAS_FOLLOWUP_QUESTIONS]: {
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
          [CAREGIVER]: {
            type: 'array',
            title: `Who was with your child when he/she was ${selectedActivity}?`,
            description: 'Please choose all that apply.',
            items: {
              type: 'string',
              enum: CAREGIVERS
            },
            uniqueItems: true,
            minItems: 1
          },
          ...followupSchema.properties,
          ...secondaryActivitySchema.properties,
          [BG_TV_DAY]: {
            type: 'string',
            title: `Was there TV in the background while your child was  ${selectedActivity}? For example,`
              + ' maybe a parent was watching TV while your child did something else in the room.',
            enum: BG_MEDIA_OPTIONS
          },
          [BG_AUDIO_DAY]: {
            title: `Was there audio in the background (e.g., music, podcast) while your child was ${selectedActivity}?`
              + ' For example, maybe a parent was listening to music while your child did something else in the room.',
            type: 'string',
            enum: BG_MEDIA_OPTIONS
          },
          [ADULT_MEDIA]: {
            type: 'string',
            title: 'Was an adult using a mobile device (phone, tablet, laptop) while your child'
              + ` was ${selectedActivity}? For example, maybe a parent was sending text messages`
              + ' while your child did something else in the room.',
            enum: BG_MEDIA_OPTIONS
          },
        },
        required: [CAREGIVER, BG_TV_DAY, BG_AUDIO_DAY, ADULT_MEDIA,
          ...followupSchema.required,
          ...secondaryActivitySchema.required],
        dependencies: {
          ...secondaryActivitySchema.dependencies,
        },
      }
    },

  };
};

const createUiSchema = (pageNum :number, selectedActivity :string) => {
  const followupUiOrder :string[] = getFollowupUiOrder(selectedActivity);
  const followUpFields = [BOOK_TYPE, BOOK_TITLE, SCREEN_MEDIA_ACTIVITY, SCREEN_MEDIA_AGE, SCREEN_MEDIA_NAME];

  const otherFollowupOrder = followUpFields.filter((field) => !followupUiOrder.includes(field));
  return {
    [getPageSectionKey(pageNum, 0)]: {
      classNames: 'column-span-12 grid-container',
      'ui:order': [HAS_FOLLOWUP_QUESTIONS, ACTIVITY_NAME, ACTIVITY_START_TIME, ACTIVITY_END_TIME,
        CAREGIVER, ...followupUiOrder,
        OTHER_ACTIVITY, SECONDARY_ACTIVITY, ...otherFollowupOrder, BG_TV_DAY,
        BG_AUDIO_DAY, ADULT_MEDIA],

      [HAS_FOLLOWUP_QUESTIONS]: {
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
      [BG_AUDIO_DAY]: {
        classNames: 'column-span-12',
        'ui:widget': 'radio'
      },
      [BG_TV_DAY]: {
        classNames: 'column-span-12',
        'ui:widget': 'radio'
      },
      [ADULT_MEDIA]: {
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
      ...FollowupSchema.uiSchema,
      ...SecondaryActivitySchema.uiSchema
    }
  };

};

export {
  createSchema,
  createUiSchema,
};
