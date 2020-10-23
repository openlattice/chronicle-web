// @flow

import { get, getIn } from 'immutable';
import { DataProcessingUtils } from 'lattice-fabricate';
import { DateTime } from 'luxon';

import * as ContextualSchema from '../schemas/ContextualSchema';
import * as DaySpanSchema from '../schemas/DaySpanSchema';
import * as NightTimeActivitySchema from '../schemas/NightTimeActivitySchema';
import * as PreSurveySchema from '../schemas/PreSurveySchema';
import * as PrimaryActivitySchema from '../schemas/PrimaryActivitySchema';
import * as SurveyIntroSchema from '../schemas/SurveyIntroSchema';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { PAGE_NUMBERS, QUESTION_TITLE_LOOKUP } from '../constants/GeneralConstants';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

const {
  DAY_SPAN_PAGE,
  FIRST_ACTIVITY_PAGE,
  PRE_SURVEY_PAGE,
  SURVEY_INTRO_PAGE
} = PAGE_NUMBERS;

const {
  ACTIVITY_END_TIME,
  ACTIVITY_NAME,
  ACTIVITY_START_TIME,
  CLOCK_FORMAT,
  DAY_END_TIME,
  DAY_START_TIME,
  HAS_FOLLOWUP_QUESTIONS,
} = PROPERTY_CONSTS;

const {
  DATETIME_END_FQN,
  DATETIME_START_FQN,
  ID_FQN,
  TITLE_FQN,
  VALUES_FQN,
} = PROPERTY_TYPE_FQNS;

const { getPageSectionKey, parsePageSectionKey } = DataProcessingUtils;

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
  formData, [getPageSectionKey(pageNum, 0), HAS_FOLLOWUP_QUESTIONS], false
);

const getIsDayTimeCompleted = (formData :Object, page :number) => {
  const prevEndTime = selectTimeByPageAndKey(page - 1, ACTIVITY_END_TIME, formData);
  const dayEndTime = selectTimeByPageAndKey(DAY_SPAN_PAGE, DAY_END_TIME, formData);

  return prevEndTime.isValid && dayEndTime.isValid
    && prevEndTime.equals(dayEndTime)
    && pageHasFollowupQuestions(formData, page - 1);
};

const getIs12HourFormatSelected = (formData :Object) :boolean => getIn(
  formData, [getPageSectionKey(SURVEY_INTRO_PAGE, 0), CLOCK_FORMAT]
) === 12;

const createFormSchema = (formData :Object, pageNum :number) => {

  const is12hourFormat = getIs12HourFormatSelected(formData);

  if (pageNum === SURVEY_INTRO_PAGE) {
    return {
      schema: SurveyIntroSchema.schema,
      uiSchema: SurveyIntroSchema.uiSchema
    };
  }
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
      schema: DaySpanSchema.createSchema(is12hourFormat),
      uiSchema: DaySpanSchema.createUiSchema(is12hourFormat)
    };
  }

  const prevStartTime = selectTimeByPageAndKey(pageNum - 1, ACTIVITY_START_TIME, formData);

  const prevEndTime = pageNum === FIRST_ACTIVITY_PAGE
    ? selectTimeByPageAndKey(DAY_SPAN_PAGE, DAY_START_TIME, formData)
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
    schema = PrimaryActivitySchema.createSchema(pageNum, prevActivity, currentActivity, prevEndTime, is12hourFormat);
    uiSchema = PrimaryActivitySchema.createUiSchema(pageNum, is12hourFormat);
  }

  return {
    schema,
    uiSchema
  };
};

const createTimeUseSummary = (formData :Object) => {

  const summary = [];

  const is12hourFormat = getIs12HourFormatSelected(formData);

  // get day duration (start and end)
  const dayStartTime :DateTime = selectTimeByPageAndKey(DAY_SPAN_PAGE, DAY_START_TIME, formData);
  const dayEndTime :DateTime = selectTimeByPageAndKey(DAY_SPAN_PAGE, DAY_END_TIME, formData);

  const formattedDayStartTime = is12hourFormat
    ? dayStartTime.toLocaleString(DateTime.TIME_SIMPLE)
    : dayStartTime.toLocaleString(DateTime.TIME_24_SIMPLE);

  const formattedDayEndTime = is12hourFormat
    ? dayEndTime.toLocaleString(DateTime.TIME_SIMPLE)
    : dayEndTime.toLocaleString(DateTime.TIME_24_SIMPLE);

  // add day start time
  summary.push({
    time: formattedDayStartTime,
    description: 'Child woke up',
    pageNum: DAY_SPAN_PAGE
  });

  const lastPage = Object.keys(formData).length - 1;

  // omit the last 'page' since it covers nighttime
  Object.keys(formData).forEach((key, index) => {
    const hasFollowupQuestions = pageHasFollowupQuestions(formData, index);

    // skip page 0, 1, 2 and pages that have followup questions
    if (!(index === SURVEY_INTRO_PAGE || index === PRE_SURVEY_PAGE
        || index === DAY_SPAN_PAGE || hasFollowupQuestions)) {
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

        const startFormatted = is12hourFormat
          ? startTime.toLocaleString(DateTime.TIME_SIMPLE)
          : startTime.toLocaleString(DateTime.TIME_24_SIMPLE);

        const endFormatted = is12hourFormat
          ? endTime.toLocaleString(DateTime.TIME_SIMPLE)
          : endTime.toLocaleString(DateTime.TIME_24_SIMPLE);

        const entry = {
          time: `${startFormatted} - ${endFormatted}`,
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
  const dayEndTime = selectTimeByPageAndKey(DAY_SPAN_PAGE, DAY_END_TIME, formData);

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

const stringifyValue = (value :any) => {
  if (typeof value === 'boolean') {
    if (value) {
      return 'true';
    }
    return 'false';
  }
  return value;
};

// TODO: omit first page (clock format select) from form
const createSubmitRequestBody = (formData :Object) => {
  let result = [];

  const dateYesterday :DateTime = DateTime.local().minus({ days: 1 });
  const entriesToOmit = [ACTIVITY_START_TIME, ACTIVITY_END_TIME, HAS_FOLLOWUP_QUESTIONS];

  Object.entries(formData).forEach(([psk :string, pageData :Object]) => {

    const parsed :Object = parsePageSectionKey(psk);
    const { page } :{ page :string } = parsed;

    if (parseInt(page, 10) !== SURVEY_INTRO_PAGE) {

      let startTime = get(pageData, ACTIVITY_START_TIME);
      let endTime = get(pageData, ACTIVITY_END_TIME);

      if (startTime && endTime) {
        startTime = DateTime.fromISO(startTime);
        startTime = dateYesterday.set({ hour: startTime.hour, minute: startTime.minute });

        endTime = DateTime.fromISO(endTime);
        endTime = dateYesterday.set({ hour: endTime.hour, minute: endTime.minute });
      }

      // $FlowFixMe
      const sectionData = Object.entries(pageData) // $FlowFixMe
        .filter((entry) => !(entry[0] === ACTIVITY_NAME && !get(pageData, HAS_FOLLOWUP_QUESTIONS, false)))
        .filter((entry) => !entriesToOmit.includes(entry[0]))
        .map(([key, value]) => {
          const stringVal = stringifyValue(value);
          const entity = {
            [VALUES_FQN.toString()]: Array.isArray(stringVal) ? stringVal : [stringVal],
            [ID_FQN.toString()]: [key],
            [TITLE_FQN.toString()]: [get(QUESTION_TITLE_LOOKUP, key, key)],
            ...(startTime && endTime) && {
              [DATETIME_START_FQN.toString()]: [startTime],
              [DATETIME_END_FQN.toString()]: [endTime]
            }
          };
          return entity;
        });

      result = [...result, ...sectionData];
    }
  });
  return result;
};

export {
  applyCustomValidation,
  createFormSchema,
  createSubmitRequestBody,
  createTimeUseSummary,
  getIs12HourFormatSelected,
  pageHasFollowupQuestions,
  selectPrimaryActivityByPage,
  selectTimeByPageAndKey,
};
