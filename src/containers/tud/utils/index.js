// @flow

import { getIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import * as ContextualSchema from '../schemas/ContextualSchema';
import * as DaySpanSchema from '../schemas/DaySpanSchema';
import * as NightTimeActivitySchema from '../schemas/NightTimeActivitySchema';
import * as PreSurveySchema from '../schemas/PreSurveySchema';
import * as PrimaryActivitySchema from '../schemas/PrimaryActivitySchema';
import { PAGE_NUMBERS } from '../constants/GeneralConstants';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

const { DAY_SPAN_PAGE, FIRST_ACTIVITY_PAGE, PRE_SURVEY_PAGE } = PAGE_NUMBERS;

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

const pageHasFollowupQuestions = (formData :Object, pageNum :number) => getIn(
  formData, [getPageSectionKey(pageNum, 0), FOLLOWUP_COMPLETED], false
);

const getIsDayTimeCompleted = (formData :Object, page :number) => {
  const prevEndTime = selectTimeByPageAndKey(page - 1, ACTIVITY_END_TIME, formData);
  const dayEndTime = selectTimeByPageAndKey(1, DAY_END_TIME, formData);

  return prevEndTime.isValid && dayEndTime.isValid
    && prevEndTime.equals(dayEndTime)
    && pageHasFollowupQuestions(formData, page - 1);
};

const createFormSchema = (formData :Object, pageNum :number) => {

  // case 1:
  if (pageNum === PRE_SURVEY_PAGE) {
    return {
      schema: PreSurveySchema.schema,
      uiSchema: PreSurveySchema.uiSchema
    };
  }

  // case 2:
  if (pageNum === DAY_SPAN_PAGE) {
    return {
      schema: DaySpanSchema.schema,
      uiSchema: DaySpanSchema.uiSchema
    };
  }

  const prevStartTime = selectTimeByPageAndKey(pageNum - 1, ACTIVITY_START_TIME, formData);

  const prevEndTime = pageNum === FIRST_ACTIVITY_PAGE
    ? selectTimeByPageAndKey(1, DAY_START_TIME, formData)
    : selectTimeByPageAndKey(pageNum - 1, ACTIVITY_END_TIME, formData);

  const currentActivity = selectPrimaryActivityByPage(pageNum, formData);
  const prevActivity = selectPrimaryActivityByPage(pageNum - 1, formData);

  const shouldDisplayFollowup = prevActivity
    && pageNum > FIRST_ACTIVITY_PAGE
    && !pageHasFollowupQuestions(formData, pageNum - 1);

  let schema;
  let uiSchema;

  const isDaytimeCompleted = getIsDayTimeCompleted(formData, pageNum);

  if (isDaytimeCompleted) {
    schema = NightTimeActivitySchema.createSchema(pageNum);
    uiSchema = NightTimeActivitySchema.createUiSchema(pageNum);
  }
  else if (shouldDisplayFollowup) {
    schema = ContextualSchema.createSchema(pageNum, prevActivity, prevStartTime, prevEndTime);
    uiSchema = ContextualSchema.createUiSchema(pageNum, prevActivity);
  }
  else {
    schema = PrimaryActivitySchema.createSchema(pageNum, prevActivity, currentActivity, prevEndTime);
    uiSchema = PrimaryActivitySchema.createUiSchema(pageNum);
  }

  return {
    schema,
    uiSchema
  };
};

const createTimeUseSummary = (formData :Object) => {

  const summary = [];

  // get day duration (start and end)
  const dayStartTime :DateTime = selectTimeByPageAndKey(1, DAY_START_TIME, formData);
  const dayEndTime :DateTime = selectTimeByPageAndKey(1, DAY_END_TIME, formData);

  const formattedDayStartTime = dayStartTime.toLocaleString(DateTime.TIME_SIMPLE);
  const formattedDayEndTime = dayEndTime.toLocaleString(DateTime.TIME_SIMPLE);

  // add day start time
  summary.push({
    time: dayStartTime.toLocaleString(DateTime.TIME_SIMPLE),
    description: 'Child woke up',
    pageNum: DAY_SPAN_PAGE
  });

  const lastPage = Object.keys(formData).length - 1;

  // omit the last 'page' since it covers nighttime
  Object.keys(formData).forEach((key, index) => {
    const hasFollowupQuestions = pageHasFollowupQuestions(formData, index);

    // skip page 0 and 1, and pages that have followup questions
    if (index !== 0 && index !== 1 && !hasFollowupQuestions) {
      // if last page
      if (index === lastPage) {
        summary.push({
          time: `${formattedDayEndTime} - ${formattedDayStartTime}`,
          description: 'Sleeping',
          pageNum: Object.keys(formData).length - 1
        });
      }
      else {
        const startTime = selectTimeByPageAndKey(index, ACTIVITY_START_TIME, formData);
        const endTime = selectTimeByPageAndKey(index, ACTIVITY_END_TIME, formData);
        const primaryActivity :string = selectPrimaryActivityByPage(index, formData);

        const entry = {
          time: `${startTime.toLocaleString(DateTime.TIME_SIMPLE)} - ${endTime.toLocaleString(DateTime.TIME_SIMPLE)}`,
          description: primaryActivity,
          pageNum: index
        };

        summary.push(entry);
      }
    }
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
  pageHasFollowupQuestions,
  selectPrimaryActivityByPage,
  selectTimeByPageAndKey,
};
