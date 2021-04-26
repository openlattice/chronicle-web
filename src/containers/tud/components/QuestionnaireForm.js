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

import TranslationKeys from '../constants/TranslationKeys';
import * as SecondaryFollowUpSchema from '../schemas/SecondaryFollowUpSchema';
import { submitTudData } from '../TimeUseDiaryActions';
import { PAGE_NUMBERS } from '../constants/GeneralConstants';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';
import {
  applyCustomValidation,
  selectPrimaryActivityByPage,
  selectTimeByPageAndKey
} from '../utils';

const { getPageSectionKey, parsePageSectionKey } = DataProcessingUtils;

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
  DAY_SPAN_PAGE,
  FIRST_ACTIVITY_PAGE,
  PRE_SURVEY_PAGE,
  SURVEY_INTRO_PAGE,
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
        const parsed :Object = parsePageSectionKey(key);
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

const updateTypicalDayLabel = (formData :Object, page :number, trans :(string, ?Object) => string) => {
  const psk = getPageSectionKey(page, 0);
  const dayOfWeek = getIn(formData, [psk, DAY_OF_WEEK]);
  if (dayOfWeek) {
    const typicalDayInput = document.getElementById(`root_${getPageSectionKey(page, 0)}_${TYPICAL_DAY_FLAG}`);
    const label = typicalDayInput?.previousSibling;
    if (label) {
      // $FlowFixMe
      label.innerHTML = trans(TranslationKeys.TYPICAL_DAY, { day: dayOfWeek });
    }
  }
};

const updatePrimaryActivityQuestion = (formData :Object, page :number, trans :(string, ?Object) => string) => {
  const currentActivity = selectPrimaryActivityByPage(page, formData);
  if (currentActivity) {
    const endTimeInput = document.getElementById(`root_${getPageSectionKey(page, 0)}_endTime`);

    const label = endTimeInput?.parentNode?.parentNode?.parentNode?.firstChild;
    if (label) {
      // $FlowFixMe
      label.innerHTML = trans(TranslationKeys.ACTIVITY_END_TIME, { activity: currentActivity });
    }
  }
};

const schemaHasFollowupQuestions = (schema :Object = {}, page :number) => {
  const psk = getPageSectionKey(page, 0);
  const properties = schema?.properties?.[psk]?.properties ?? {};

  return Object.keys(properties).includes(HAS_FOLLOWUP_QUESTIONS);
};

type TudActivities = {|
  childcare :'string';
  napping :'string';
  eating :'string';
  media_use :'string';
  reading :'string';
  indoor :'string';
  outdoor :'string';
  grooming :'string';
  other :'string';
  outdoors :'string';
|};

type Props = {
  familyId :?string;
  formSchema :Object;
  initialFormData :Object;
  isSummaryPage :boolean;
  language :string;
  organizationId :UUID;
  pagedProps :Object;
  participantId :string;
  resetSurvey :(Function) => void;
  shouldReset :boolean;
  studyId :UUID;
  submitRequestState :?RequestState;
  trans :(string, ?Object) => Object;
  translationData :Object;
  updateFormState :(newSchema :Object, uiSchema :Object, formData :Object) => void;
  updateSurveyProgress :(formData :Object) => void;
  waveId :?string;
};

const QuestionnaireForm = ({
  familyId,
  formSchema,
  initialFormData,
  isSummaryPage,
  language,
  organizationId,
  pagedProps,
  participantId,
  resetSurvey,
  shouldReset,
  studyId,
  submitRequestState,
  trans,
  translationData,
  updateFormState,
  updateSurveyProgress,
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

  if (shouldReset) resetSurvey(setPage);

  const dispatch = useDispatch();

  const { schema, uiSchema } = formSchema;

  const activities :TudActivities = trans(TranslationKeys.PRIMARY_ACTIVITIES, { returnObjects: true });

  const readingSchema = SecondaryFollowUpSchema.createSchema(activities.reading, trans);
  const mediaUseSchema = SecondaryFollowUpSchema.createSchema(activities.media_use, trans);

  const handleNext = () => {
    if (isSummaryPage) {
      dispatch(submitTudData({
        familyId,
        formData: pagedData,
        organizationId,
        participantId,
        studyId,
        waveId,
        language,
        translationData
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

    if (secondaryActivities.includes(activities.media_use)) {
      newProperties = merge(newProperties, mediaProperties);
      newRequired = merge(newRequired, mediaRequired);
    }
    else {
      // remove media properties & required
      Object.keys(mediaProperties).forEach((property) => delete newProperties[property]);
      newRequired = newRequired.filter((property) => !mediaRequired.includes(property));
    }

    if (secondaryActivities.includes(activities.reading)) {
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
    updatePrimaryActivityQuestion(formData, page, trans);

    if (page === PRE_SURVEY_PAGE) {
      updateTypicalDayLabel(formData, page, trans);
    }

    if (schemaHasFollowupQuestions(currentSchema, page)) {
      updateFormSchema(formData, currentSchema, currentUiSchema);
    }

    updateSurveyProgress(formData);
  };

  const validate = (formData, errors) => (
    applyCustomValidation(formData, errors, page, trans)
  );

  /* eslint-disable no-param-reassign */
  const transformErrors = (errors) => errors.map((error) => {
    if (error.name === 'required') {
      error.message = trans(TranslationKeys.ERROR_RESPONSE_REQUIRED);
    }
    if (error.name === 'minItems') {
      error.message = trans(TranslationKeys.ERROR_MIN_ITEMS);
    }
    if (error.name === 'enum' || error.name === 'oneOf') {
      error.message = '';
    }
    return error;
  });
  /* eslint-enable */

  const schemaHasFollowup = schemaHasFollowupQuestions(schema, page);
  const prevActivity = selectPrimaryActivityByPage(page - 1, pagedData);
  const prevEndTime = selectTimeByPageAndKey(page - 1, ACTIVITY_START_TIME, pagedData);

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
                    time={prevEndTime}
                    trans={trans} />
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
                transformErrors={transformErrors}
                uiSchema={uiSchema}
                validate={validate} />

          </>
        )
      }

      <ButtonRow>
        <Button
            disabled={page === 0 || submitRequestState === RequestStates.PENDING}
            onClick={onBack}>
          {trans(TranslationKeys.BTN_BACK)}
        </Button>
        <Button
            color="primary"
            isLoading={submitRequestState === RequestStates.PENDING}
            onClick={handleNext}>
          {
            isSummaryPage ? trans(TranslationKeys.BTN_SUBMIT) : trans(TranslationKeys.BTN_NEXT)
          }
        </Button>
      </ButtonRow>
    </>
  );
};

export default QuestionnaireForm;
