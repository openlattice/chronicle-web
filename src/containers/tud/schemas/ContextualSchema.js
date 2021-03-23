// @flow

import merge from 'lodash/merge';
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import * as FollowupSchema from './FollowupSchema';
import * as SecondaryActivitySchema from './SecondaryActivitySchema';
import * as SecondaryFollowUpSchema from './SecondaryFollowUpSchema';

import TranslationKeys from '../constants/TranslationKeys';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

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
  isSecondaryMediaSelected :boolean,
  trans :(string, ?Object) => Object
) => {

  const psk = getPageSectionKey(pageNum, 0);

  const activities :Object = trans(TranslationKeys.PRIMARY_ACTIVITIES, { returnObjects: true });

  const secondaryReadingSchema = SecondaryFollowUpSchema.createSchema(activities.reading, trans);
  const secondaryMediaSchema = SecondaryFollowUpSchema.createSchema(activities.media_use, trans);

  const followupSchema = FollowupSchema.createSchema(selectedActivity, trans);
  const secondaryActivitySchema = SecondaryActivitySchema.createSchema(selectedActivity, trans);

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
            title: trans(TranslationKeys.CAREGIVER, {
              activity: selectedActivity,
              interpolation: { escapeValue: false }
            }),
            description: trans(TranslationKeys.CHOOSE_APPLICABLE),
            items: {
              type: 'string',
              enum: trans(TranslationKeys.CAREGIVER_OPTIONS, { returnObjects: true })
            },
            uniqueItems: true,
            minItems: 1
          },
          ...followupSchema.properties,
          ...secondaryActivitySchema.properties,
          [BG_TV_DAY]: {
            type: 'string',
            title: trans(TranslationKeys.BG_TV_DAY, {
              activity: selectedActivity,
              interpolation: { escapeValue: false }
            }),
            enum: trans(TranslationKeys.BG_MEDIA_OPTIONS, { returnObjects: true })
          },
          [BG_AUDIO_DAY]: {
            title: trans(TranslationKeys.BG_AUDIO_DAY, {
              activity: selectedActivity,
              interpolation: { escapeValue: false }
            }),
            type: 'string',
            enum: trans(TranslationKeys.BG_MEDIA_OPTIONS, { returnObjects: true })
          },
          [ADULT_MEDIA]: {
            type: 'string',
            title: trans(TranslationKeys.ADULT_MEDIA, {
              activity: selectedActivity,
              interpolation: { escapeValue: false }
            }),
            enum: trans(TranslationKeys.BG_MEDIA_OPTIONS, { returnObjects: true })
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

const createUiSchema = (pageNum :number, trans :(string, ?Object) => Object) => {

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
          noneText: trans(TranslationKeys.NO_ONE)
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
