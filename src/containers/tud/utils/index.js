// @flow

import { getIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import { ACTIVITIES, SCHEMA_CONSTANTS } from '../constants';

const {
  ACTIVITY_NAME,
  ACTIVITY_END_TIME,
  ACTIVITY_START_TIME,
  DAY_END_TIME,
  DAY_START_TIME
} = SCHEMA_CONSTANTS;

const { getPageSectionKey } = DataProcessingUtils;

const selectDayStartTime = (formData :Object) => {
  const psk = getPageSectionKey(1, 0);
  return getIn(formData, [psk, DAY_START_TIME]);
};

const selectActivityEndTimeByPage = (pageNum :number, formData :Object) => {
  if (pageNum < 0) return undefined;

  const psk = getPageSectionKey(pageNum, 0);
  return getIn(formData, [psk, ACTIVITY_END_TIME]);
};

const selectPrimaryActivityByPage = (pageNum :number, formData :Object) => {
  if (pageNum < 0) return undefined;

  const psk = getPageSectionKey(pageNum, 0);

  const activityName = getIn(formData, [psk, ACTIVITY_NAME]);
  return ACTIVITIES.find((activity) => activity.name === activityName);
};

const createFormSchema = (pageNum :number, formData :Object) => {

  const prevActivity = selectPrimaryActivityByPage(pageNum - 1, formData);
  const prevEndTime = pageNum === 2 ? selectDayStartTime(formData) : selectActivityEndTimeByPage(pageNum - 1, formData);
  const formattedTime = DateTime.fromISO(prevEndTime || '').toLocaleString(DateTime.TIME_SIMPLE);

  const currentActivity = selectPrimaryActivityByPage(pageNum, formData);

  return {
    type: 'object',
    title: '',
    properties: {
      [getPageSectionKey(pageNum, 0)]: {
        properties: {
          [ACTIVITY_NAME]: {
            type: 'string',
            title: (pageNum === 2
              ? `What did your child start doing at ${formattedTime}?`
              : `What time did your child start doing at ${formattedTime} after they
                finished ${(prevActivity || {}).description}?`),
            enum: ACTIVITIES.map((activity) => activity.name)
          },
          [ACTIVITY_START_TIME]: {
            type: 'string',
            title: '',
            default: prevEndTime
          },
          [ACTIVITY_END_TIME]: {
            id: 'end_time',
            type: 'string',
            title: currentActivity ? `When did your child stop ${currentActivity.description}?`
              : 'When did the selected activity end?'
          }
        },
        title: '',
        type: 'object',
        required: [ACTIVITY_NAME, ACTIVITY_END_TIME]
      }
    },
  };
};

const createUiSchema = (pageNum :number) => ({
  [getPageSectionKey(pageNum, 0)]: {
    classNames: 'column-span-12',
    [ACTIVITY_NAME]: {
      classNames: (pageNum === 1 ? 'hidden' : 'column-span-12')
    },
    [ACTIVITY_START_TIME]: {
      classNames: (pageNum === 1 ? 'column-span-12' : 'hidden'),
      'ui:widget': 'TimeWidget',
      'ui:options': {
        placeholder: 'HH:MM',
        mask: '_:_'
      }
    },
    [ACTIVITY_END_TIME]: {
      classNames: 'column-span-12',
      'ui:widget': 'TimeWidget',
      'ui:options': {
        placeholder: 'HH:MM',
        mask: '_:_'
      },
    },
  }
});

const applyCustomValidation = (formData :Object, errors :Object, pageNum :number) => {
  const psk = getPageSectionKey(pageNum, 0);

  // For each activity, end date should greater than start date
  const startTimeKey = pageNum === 1 ? DAY_START_TIME : ACTIVITY_START_TIME;
  const endTimeKey = pageNum === 1 ? DAY_END_TIME : ACTIVITY_END_TIME;

  const currentStartTime = getIn(formData, [psk, startTimeKey]);
  const currentEndTime = getIn(formData, [psk, endTimeKey]);
  const dayEndTime = getIn(formData, [getPageSectionKey(1, 0), DAY_END_TIME]);

  const startTimeISO = DateTime.fromISO(currentStartTime);
  const endTimeISO = DateTime.fromISO(currentEndTime);
  const dayEndTimeISO = DateTime.fromISO(dayEndTime);

  const errorMsg = pageNum === 1
    ? `Bed time should be after ${startTimeISO.toLocaleString(DateTime.TIME_SIMPLE)}`
    : `End time should be after ${startTimeISO.toLocaleString(DateTime.TIME_SIMPLE)}`;

  if (startTimeISO.isValid && endTimeISO.isValid) {
    // $FlowFixMe invalid-compare
    if (endTimeISO < startTimeISO) {
      errors[psk][endTimeKey].addError(errorMsg);
    }
    // $FlowFixMe invalid-compare
    if (endTimeISO > dayEndTimeISO) {
      errors[psk][endTimeKey].addError(`The last activity of the
          day should end at ${dayEndTimeISO.toLocaleString(DateTime.TIME_SIMPLE)}`);
    }
  }

  return errors;
};

export {
  applyCustomValidation,
  createFormSchema,
  createUiSchema,
  selectPrimaryActivityByPage
};
