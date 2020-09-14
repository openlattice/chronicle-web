// @flow

import { get, getIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import * as ContextualSchema from '../schemas/ContextualSchema';
import { ACTIVITY_NAMES, PRIMARY_ACTIVITIES } from '../constants/ActivitiesConstants';
import { PAGE_NUMBERS } from '../constants/GeneralConstants';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

const { DAY_SPAN_PAGE, FIRST_ACTIVITY_PAGE } = PAGE_NUMBERS;

const {
  CHILDCARE,
  GROOMING,
} = ACTIVITY_NAMES;

const {
  ACTIVITY_END_TIME,
  ACTIVITY_NAME,
  ACTIVITY_START_TIME,
  DAY_END_TIME,
  DAY_START_TIME,
  FOLLOWUP_COMPLETED
} = PROPERTY_CONSTS;

const { getPageSectionKey } = DataProcessingUtils;

const selectTimeByPageAndKey = (pageNum :number, key :string, formData :Object) => {
  const psk = getPageSectionKey(pageNum, 0);
  const result = getIn(formData, [psk, key]);
  return DateTime.fromISO(result);
};

const selectPrimaryActivityByPage = (pageNum :number, formData :Object) :string => {
  const psk = getPageSectionKey(pageNum, 0);

  const activityName = getIn(formData, [psk, ACTIVITY_NAME]);
  return activityName;
};

const hasFollowUpQuestions = (activity :string, pageNum :number, formData :Object) => {
  const psk = getPageSectionKey(pageNum, 0);
  const isFollowupCompleted = getIn(formData, [psk, FOLLOWUP_COMPLETED], false);

  return ![GROOMING, CHILDCARE].includes(activity) && !isFollowupCompleted;
};

const createFormSchema = (pageNum :number, formData :Object) => {

  // const prevStartTime = pageNum === FIRST_ACTIVITY_PAGE
  //   ? selectTimeByPageAndKey(1, DAY_)
  const prevStartTime = selectTimeByPageAndKey(pageNum - 1, ACTIVITY_START_TIME, formData);

  const prevEndTime = pageNum === FIRST_ACTIVITY_PAGE
    ? selectTimeByPageAndKey(1, DAY_START_TIME, formData)
    : selectTimeByPageAndKey(pageNum - 1, ACTIVITY_END_TIME, formData);
  const formattedTime = prevEndTime.toLocaleString(DateTime.TIME_SIMPLE);

  const currentActivity = selectPrimaryActivityByPage(pageNum, formData);
  const prevActivity = selectPrimaryActivityByPage(pageNum - 1, formData);

  if (prevActivity && pageNum > FIRST_ACTIVITY_PAGE && hasFollowUpQuestions(prevActivity, pageNum - 1, formData)) {
    return ContextualSchema.createSchema(pageNum, prevActivity, prevStartTime, prevEndTime);
  }

  return {
    type: 'object',
    title: '',
    properties: {
      [getPageSectionKey(pageNum, 0)]: {
        title: '',
        type: 'object',
        properties: {
          [ACTIVITY_NAME]: {
            type: 'string',
            title: (pageNum === FIRST_ACTIVITY_PAGE
              ? `What did your child start doing at ${formattedTime}?`
              : `What time did your child start doing at ${formattedTime} after they `
                + `finished ${(prevActivity)}?`),
            enum: PRIMARY_ACTIVITIES
          },
          [ACTIVITY_START_TIME]: {
            type: 'string',
            title: '',
            default: prevEndTime.toLocaleString(DateTime.TIME_24_SIMPLE)
          },
          [ACTIVITY_END_TIME]: {
            id: 'end_time',
            type: 'string',
            title: currentActivity
              ? `When did your child stop ${currentActivity}?`
              : 'When did the selected activity end?'
          },
        },
        required: [ACTIVITY_NAME, ACTIVITY_END_TIME]
      }
    },
  };
};

const createUiSchema = (pageNum :number, formData :Object) => {

  const prevActivity = selectPrimaryActivityByPage(pageNum - 1, formData);

  if (prevActivity && pageNum > FIRST_ACTIVITY_PAGE && hasFollowUpQuestions(prevActivity, pageNum - 1, formData)) {
    return ContextualSchema.createUiSchema(pageNum, prevActivity);
  }

  return {
    [getPageSectionKey(pageNum, 0)]: {
      classNames: 'column-span-12 grid-container',
      [ACTIVITY_NAME]: {
        classNames: (pageNum === DAY_SPAN_PAGE ? 'hidden' : 'column-span-12')
      },
      [ACTIVITY_START_TIME]: {
        classNames: (pageNum === DAY_SPAN_PAGE ? 'column-span-12' : 'hidden'),
        'ui:widget': 'TimeWidget',
      },
      [ACTIVITY_END_TIME]: {
        classNames: 'column-span-12',
        'ui:widget': 'TimeWidget'
      },
    },
  };
};

const createTimeUseSummary = (formData :Object) => {

  const summary = [];

  // get day duration (start and end)
  const dayStartTime = selectTimeByPageAndKey(1, DAY_START_TIME, formData);
  const dayEndTime = selectTimeByPageAndKey(1, DAY_END_TIME, formData);

  // add day start time
  summary.push({
    time: dayStartTime.toLocaleString(DateTime.TIME_SIMPLE),
    description: 'Child woke up',
    pageNum: DAY_SPAN_PAGE
  });

  Object.keys(formData).forEach((key, index) => {
    if (index !== 0 && index !== 1) { // skip page 0 and 1
      const startTime = selectTimeByPageAndKey(index, ACTIVITY_START_TIME, formData);
      const endTime = selectTimeByPageAndKey(index, ACTIVITY_END_TIME, formData);
      const primaryActivity = selectPrimaryActivityByPage(index, formData);

      const entry = {
        time: `${startTime.toLocaleString(DateTime.TIME_SIMPLE)} - ${endTime.toLocaleString(DateTime.TIME_SIMPLE)}`,
        description: get(primaryActivity, 'name'),
        pageNum: index
      };

      summary.push(entry);
    }
  });

  // add end of day
  summary.push({
    time: dayEndTime.toLocaleString(DateTime.TIME_SIMPLE),
    description: 'Child went to bed',
    pageNum: DAY_SPAN_PAGE
  });

  return summary;
};

const applyCustomValidation = (formData :Object, errors :Object, pageNum :number) => {
  const psk = getPageSectionKey(pageNum, 0);

  // For each activity, end date should greater than start date
  const startTimeKey = pageNum === DAY_SPAN_PAGE ? DAY_START_TIME : ACTIVITY_START_TIME;
  const endTimeKey = pageNum === DAY_SPAN_PAGE ? DAY_END_TIME : ACTIVITY_END_TIME;

  const currentStartTime = selectTimeByPageAndKey(pageNum, startTimeKey, formData);
  const currentEndTime = selectTimeByPageAndKey(pageNum, endTimeKey, formData);
  const dayEndTime = selectTimeByPageAndKey(1, DAY_END_TIME, formData);

  const errorMsg = pageNum === DAY_SPAN_PAGE
    ? `Bed time should be after ${currentStartTime.toLocaleString(DateTime.TIME_SIMPLE)}`
    : `End time should be after ${currentStartTime.toLocaleString(DateTime.TIME_SIMPLE)}`;

  if (currentStartTime.isValid && currentEndTime.isValid) {
    // $FlowFixMe invalid-compare
    if (currentEndTime <= currentStartTime) {
      errors[psk][endTimeKey].addError(errorMsg);
    }
    // the last activity of the day should end at the time the child went to bed
    // $FlowFixMe invalid-compare
    if (currentEndTime > dayEndTime) {
      errors[psk][endTimeKey].addError(`The last activity of the
          day should end at ${dayEndTime.toLocaleString(DateTime.TIME_SIMPLE)}
          since you indicated the child went to bed then.`);
    }
  }

  return errors;
};

export {
  applyCustomValidation,
  createFormSchema,
  createTimeUseSummary,
  createUiSchema,
  selectPrimaryActivityByPage,
  selectTimeByPageAndKey
};
