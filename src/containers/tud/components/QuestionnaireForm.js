// @flow

import React from 'react';

import styled from 'styled-components';
import { getIn, merge, setIn } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Button } from 'lattice-ui-kit';
import { set, unset } from 'lodash';
import { DateTime } from 'luxon';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import ContextualQuestionsIntro from './ContextualQuestionsIntro';
import SurveyIntro from './SurveyIntro';
import TimeUseSummary from './TimeUseSummary';

import * as SecondaryFollowUpSchema from '../schemas/SecondaryFollowUpSchema';
import { submitTudData } from '../TimeUseDiaryActions';
import { PAGE_NUMBERS } from '../constants/GeneralConstants';
import { PRIMARY_ACTIVITIES, PROPERTY_CONSTS } from '../constants/SchemaConstants';
import {
  applyCustomValidation,
  getIs12HourFormatSelected,
  pageHasFollowupQuestions,
  selectPrimaryActivityByPage,
  selectTimeByPageAndKey
} from '../utils';

const { getPageSectionKey, parsePageSectionKey } = DataProcessingUtils;

const { READING, MEDIA_USE } = PRIMARY_ACTIVITIES;

const {
  ACTIVITY_END_TIME,
  ACTIVITY_START_TIME,
  DAY_END_TIME,
  DAY_OF_WEEK,
  DAY_START_TIME,
  HAS_FOLLOWUP_QUESTIONS,
  SECONDARY_ACTIVITY,
  SLEEP_ARRANGEMENT,
  TYPICAL_DAY_FLAG,
} = PROPERTY_CONSTS;

const {
  FIRST_ACTIVITY_PAGE,
  PRE_SURVEY_PAGE,
  SURVEY_INTRO_PAGE,
  DAY_SPAN_PAGE
} = PAGE_NUMBERS;

const ButtonRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;

/*
 * This code fixes an issue where the survey enters an error state after a user fills out the survey
 * and later changes the day end time value. If the day end time is changed such that certain sections
 * of the formRef state contain invalid data (the start/end values are out of range), then this will cause
 * validateAndSubmit to fail, hence the need to remove such sections. This deletion need only take place
 * just before we enter the nightActivity portion of the survey. At this point, for all x s.t x > page
 * only x == page + 1 can be expected to contain any data
  (and it should be nightActivity data otherwise it also needs to be deleted)
 */

const removeExtraData = (formRef :Object, pagedData, page :number) => {
  const psk = getPageSectionKey(page, 0);
  const dayEndTime :?DateTime = selectTimeByPageAndKey(DAY_SPAN_PAGE, DAY_END_TIME, pagedData);
  const formData :Object = formRef?.current?.state?.formData || {};

  const currEndTime = formData[psk]?.[ACTIVITY_END_TIME];

  if (dayEndTime && currEndTime) {
    const currEndDateTime :DateTime = DateTime.fromSQL(currEndTime);
    if (!currEndDateTime.equals(dayEndTime)) {
      return;
    }

    const pages = Object.keys(formData)
      .map((key) => {
        const parsed = parsePageSectionKey(key);
        return Number(parsed.page);
      });

    let toRemoveStartIndex = page + 1;
    // if the next page has night activity page data, skip
    const nextPageData = formData[getPageSectionKey(toRemoveStartIndex, 0)] || {};
    if (Object.keys(nextPageData).includes(SLEEP_ARRANGEMENT)) {
      toRemoveStartIndex += 1;
    }

    const toRemovePsks = pages
      .filter((index) => index >= toRemoveStartIndex)
      .map((index) => getPageSectionKey(index, 0));

    toRemovePsks.forEach((toRemovePsk) => {
      unset(formData, toRemovePsk);
    });
  }
};

/*
 * Return true if the current page should display a summary of activities
 * Summary page is displayed after night activity page, hence page - 2 accounts for the night activity page
 */
const getIsSummaryPage = (formData :Object, page :number) => {
  const prevEndTime = selectTimeByPageAndKey(page - 2, ACTIVITY_END_TIME, formData);
  const dayEndTime = selectTimeByPageAndKey(DAY_SPAN_PAGE, DAY_END_TIME, formData);

  return prevEndTime.isValid && dayEndTime.isValid
    && prevEndTime.equals(dayEndTime)
    && pageHasFollowupQuestions(formData, page - 2);
};

/*
 * This code is crucial when onSubmit is invoked on a page that already contains form data.
 * Ideally, when the endTime value on the previous page is modified, the startTime of current page's
 * activity should be updated to match the new value if the prev page doesn't need followup.
 * Conversely, if the current page contains follow up questions to prev page, the endTime value on
 * current page should be updated. In this case however, onSubmit fails
 * to update the form data state accordingly through the schema's property default value,
 * hence the need for this function.
 */
const forceFormDataStateUpdate = (formRef :Object, pagedData :Object = {}, page :number) => {
  const psk = getPageSectionKey(page, 0);
  const prevEndTime = selectTimeByPageAndKey(
    page - 1, (page === FIRST_ACTIVITY_PAGE ? DAY_START_TIME : ACTIVITY_END_TIME), pagedData
  );
  const activityStartTime = selectTimeByPageAndKey(
    page - 1, (page === FIRST_ACTIVITY_PAGE ? DAY_START_TIME : ACTIVITY_START_TIME), pagedData
  );

  // current page already contains form data
  if (Object.keys(pagedData).includes(psk) && prevEndTime.isValid && activityStartTime.isValid) {
    const formattedEndTime = prevEndTime.toLocaleString(DateTime.TIME_24_SIMPLE);
    const formattedStartTime = activityStartTime.toLocaleString(DateTime.TIME_24_SIMPLE);

    const sectionData = pagedData[psk];
    const formData = formRef?.current?.state?.formData || {};

    // current page contains followup questions for selected primary activity
    if (Object.keys(sectionData).includes(HAS_FOLLOWUP_QUESTIONS)) {
      set(formData, [psk, ACTIVITY_END_TIME], formattedEndTime);
      set(formData, [psk, ACTIVITY_START_TIME], formattedStartTime);
      removeExtraData(formRef, pagedData, page);
    }

    // current page is night activity page
    else if (!Object.keys(sectionData).includes(SLEEP_ARRANGEMENT)) {
      set(formData, [psk, ACTIVITY_START_TIME], formattedEndTime);
    }
  }
};

const updateTypicalDayLabel = (formData :Object, page :number) => {
  const psk = getPageSectionKey(page, 0);
  const dayOfWeek = getIn(formData, [psk, DAY_OF_WEEK]);
  if (dayOfWeek) {
    const typicalDayInput = document.getElementById(`root_${getPageSectionKey(page, 0)}_${TYPICAL_DAY_FLAG}`);
    const label = typicalDayInput?.previousSibling;
    if (label) {
      // $FlowFixMe
      label.innerHTML = 'An important part of this project is to find out how children spend'
        + ` their time during the week. Was yesterday a typical ${dayOfWeek} for you`
        + ' and your child? A non-typical day would include a school closing, being on vacation, or being home sick.';
    }
  }
};

const updatePrimaryActivityQuestion = (formData :Object, page :number) => {
  const currentActivity = selectPrimaryActivityByPage(page, formData);
  if (currentActivity) {
    const endTimeInput = document.getElementById(`root_${getPageSectionKey(page, 0)}_endTime`);

    const label = endTimeInput?.parentNode?.parentNode?.parentNode?.firstChild;
    if (label) {
      // $FlowFixMe
      label.innerHTML = `When did your child stop ${currentActivity}?`;
    }
  }
};

const schemaHasFollowupQuestions = (schema :Object = {}, page :number) => {
  const psk = getPageSectionKey(page, 0);
  const properties = schema?.properties?.[psk]?.properties ?? {};

  return Object.keys(properties).includes(HAS_FOLLOWUP_QUESTIONS);
};

type Props = {
  familyId :?string;
  formSchema :Object;
  initialFormData :Object;
  pagedProps :Object;
  participantId :string;
  studyId :UUID;
  submitRequestState :?RequestState;
  updateFormState :(newSchema :Object, uiSchema :Object, formData :Object) => void;
  waveId :?string;
  organizationId :UUID;
};

const QuestionnaireForm = ({
  familyId,
  formSchema,
  initialFormData,
  organizationId,
  pagedProps,
  participantId,
  studyId,
  submitRequestState,
  updateFormState,
  waveId,
} :Props) => {

  const {
    formRef,
    onBack,
    onNext,
    page,
    pagedData,
    setPage,
    validateAndSubmit
  } = pagedProps;

  const dispatch = useDispatch();

  const { schema, uiSchema } = formSchema;

  const readingSchema = SecondaryFollowUpSchema.createSchema(READING);
  const mediaUseSchema = SecondaryFollowUpSchema.createSchema(MEDIA_USE);

  const isSummaryPage = getIsSummaryPage(pagedData, page);

  const handleNext = () => {
    if (isSummaryPage) {
      dispatch(submitTudData({
        familyId,
        formData: pagedData,
        organizationId,
        participantId,
        studyId,
        waveId,
      }));
      return;
    }

    forceFormDataStateUpdate(formRef, pagedData, page);
    validateAndSubmit();
  };

  const updateFormSchema = (formData, currentSchema, currentUiSchema) => {
    const psk = getPageSectionKey(page, 0);
    const secondaryActivities = getIn(formData, [psk, SECONDARY_ACTIVITY], []);

    const { properties: mediaProperties, required: mediaRequired } = mediaUseSchema;
    const { properties: readingProperties, required: readingRequired } = readingSchema;

    let newProperties = getIn(currentSchema, ['properties', psk, 'properties'], {});
    let newRequired = getIn(currentSchema, ['properties', psk, 'required'], []);

    if (secondaryActivities.includes(MEDIA_USE)) {
      newProperties = merge(newProperties, mediaProperties);
      newRequired = merge(newRequired, mediaRequired);
    }
    else {
      // remove media properties & required
      Object.keys(mediaProperties).forEach((property) => delete newProperties[property]);
      newRequired = newRequired.filter((property) => !mediaRequired.includes(property));
    }

    if (secondaryActivities.includes(READING)) {
      newProperties = merge(newProperties, readingProperties);
      newRequired = merge(newRequired, readingRequired);
    }
    else {
      // remove reading properties & required
      Object.keys(readingProperties).forEach((property) => delete newProperties[property]);
      newRequired = newRequired.filter((property) => !readingRequired.includes(property));
    }

    let newSchema = setIn(currentSchema, ['properties', psk, 'properties'], newProperties);
    newSchema = setIn(newSchema, ['properties', psk, 'required'], [...new Set(newRequired)]);

    updateFormState(newSchema, currentUiSchema, formData);
  };

  const onChange = ({ formData, schema: currentSchema, uiSchema: currentUiSchema }) => {
    updatePrimaryActivityQuestion(formData, page);

    if (page === PRE_SURVEY_PAGE) {
      updateTypicalDayLabel(formData, page);
    }

    if (schemaHasFollowupQuestions(currentSchema, page)) {
      updateFormSchema(formData, currentSchema, currentUiSchema);
    }
  };

  const validate = (formData, errors) => (
    applyCustomValidation(formData, errors, page)
  );

  const schemaHasFollowup = schemaHasFollowupQuestions(schema, page);
  const prevActivity = selectPrimaryActivityByPage(page - 1, pagedData);
  const prevEndTime = selectTimeByPageAndKey(page - 1, ACTIVITY_START_TIME, pagedData);

  const is12hourFormat = getIs12HourFormatSelected(pagedData);
  const formattedPrevEndTime = is12hourFormat
    ? prevEndTime.toLocaleString(DateTime.TIME_SIMPLE)
    : prevEndTime.toLocaleString(DateTime.TIME_24_SIMPLE);

  return (
    <>
      {
        isSummaryPage ? (
          <TimeUseSummary
              formData={pagedData}
              goToPage={setPage} />
        ) : (
          <>
            {
              schemaHasFollowup && (
                <ContextualQuestionsIntro
                    selectedActivity={prevActivity}
                    time={formattedPrevEndTime} />
              )
            }
            {
              page === SURVEY_INTRO_PAGE && <SurveyIntro />
            }
            <Form
                formData={initialFormData}
                hideSubmit
                noPadding
                onChange={onChange}
                onSubmit={onNext}
                ref={formRef}
                schema={schema}
                uiSchema={uiSchema}
                validate={validate} />

          </>
        )
      }

      <ButtonRow>
        <Button
            disabled={page === 0 || submitRequestState === RequestStates.PENDING}
            onClick={onBack}>
          Back
        </Button>
        <Button
            color="primary"
            isLoading={submitRequestState === RequestStates.PENDING}
            onClick={handleNext}>
          {
            isSummaryPage ? 'Submit' : 'Next'
          }
        </Button>
      </ButtonRow>
    </>
  );
};

export default QuestionnaireForm;
