// @flow

import { DataProcessingUtils } from 'lattice-fabricate';
import { merge } from 'lodash';
import { DateTime } from 'luxon';

import * as FollowupSchema from './FollowupSchema';
import * as SecondaryActivitySchema from './SecondaryActivitySchema';
import * as SecondaryFollowUpSchema from './SecondaryFollowUpSchema';

import {
  BG_MEDIA_OPTIONS,
  CAREGIVERS,
  PRIMARY_ACTIVITIES,
  PROPERTY_CONSTS
} from '../constants/SchemaConstants';

const { READING, MEDIA_USE } = PRIMARY_ACTIVITIES;

const secondaryReadingSchema = SecondaryFollowUpSchema.createSchema(READING);
const secondaryMediaSchema = SecondaryFollowUpSchema.createSchema(MEDIA_USE);

const { getPageSectionKey } = DataProcessingUtils;
const {
  ACTIVITY_END_TIME,
  ACTIVITY_NAME,
  ACTIVITY_START_TIME,
  ADULT_MEDIA,
  BG_AUDIO_DAY,
  BG_TV_DAY,
  CAREGIVER,
  HAS_FOLLOWUP_QUESTIONS,
  OTHER_ACTIVITY,
  PRIMARY_BOOK_TITLE,
  PRIMARY_BOOK_TYPE,
  PRIMARY_MEDIA_ACTIVITY,
  PRIMARY_MEDIA_AGE,
  PRIMARY_MEDIA_NAME,
  SECONDARY_ACTIVITY,
  SECONDARY_BOOK_TITLE,
  SECONDARY_BOOK_TYPE,
  SECONDARY_MEDIA_ACTIVITY,
  SECONDARY_MEDIA_AGE,
  SECONDARY_MEDIA_NAME,
} = PROPERTY_CONSTS;

const createSchema = (
  pageNum :number,
  selectedActivity :string,
  prevStartTime :DateTime,
  prevEndTime :DateTime,
  isSecondaryReadingSelected :boolean,
  isSecondaryMediaSelected :boolean
) => {

  const psk = getPageSectionKey(pageNum, 0);

  const followupSchema = FollowupSchema.createSchema(selectedActivity);
  const secondaryActivitySchema = SecondaryActivitySchema.createSchema(selectedActivity);

  const schema = {
    type: 'object',
    title: '',
    properties: {
      [psk]: {
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

  if (isSecondaryReadingSelected) {
    merge(schema[psk], secondaryReadingSchema);
  }

  if (isSecondaryMediaSelected) {
    merge(schema[psk], secondaryMediaSchema);
  }

  return schema;
};

const createUiSchema = (pageNum :number) => {

  const primaryFollowupOrder = [
    PRIMARY_BOOK_TYPE, PRIMARY_BOOK_TITLE, PRIMARY_MEDIA_ACTIVITY, PRIMARY_MEDIA_AGE, PRIMARY_MEDIA_NAME];
  const secondaryFollowupOrder = [
    SECONDARY_BOOK_TYPE, SECONDARY_BOOK_TITLE, SECONDARY_MEDIA_ACTIVITY, SECONDARY_MEDIA_AGE, SECONDARY_MEDIA_NAME];

  return {
    [getPageSectionKey(pageNum, 0)]: {
      classNames: 'column-span-12 grid-container',
      'ui:order': [HAS_FOLLOWUP_QUESTIONS, ACTIVITY_NAME, ACTIVITY_START_TIME, ACTIVITY_END_TIME,
        CAREGIVER, ...primaryFollowupOrder,
        OTHER_ACTIVITY, SECONDARY_ACTIVITY, ...secondaryFollowupOrder, BG_TV_DAY,
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
      [PRIMARY_BOOK_TYPE]: {
        classNames: 'column-span-12',
        'ui:widget': 'checkboxes',
        'ui:options': {
          withOther: 'true'
        }
      },
      [PRIMARY_BOOK_TITLE]: {
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
