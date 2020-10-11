// @flow

import React from 'react';

import set from 'lodash/set';
import styled from 'styled-components';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Button, Typography } from 'lattice-ui-kit';
import { DateTime } from 'luxon';

import TimeUseSummary from './TimeUseSummary';

import { PAGE_NUMBERS } from '../constants/GeneralConstants';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';
import {
  applyCustomValidation,
  createFormSchema,
  pageHasFollowupQuestions,
  selectPrimaryActivityByPage,
  selectTimeByPageAndKey
} from '../utils';

const { getPageSectionKey } = DataProcessingUtils;

const {
  ACTIVITY_END_TIME,
  ACTIVITY_START_TIME,
  DAY_END_TIME,
  DAY_START_TIME,
  HAS_FOLLOWUP_QUESTIONS,
  SLEEP_ARRANGEMENT,
} = PROPERTY_CONSTS;

const { FIRST_ACTIVITY_PAGE } = PAGE_NUMBERS;

const ButtonRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;

/*
 * Return true if the current page should display a summary of activities
 * Summary page is displayed after night activity page, hence page - 2 accounts for the night activity page
 */
const getIsSummaryPage = (formData :Object, page :number) => {
  const prevEndTime = selectTimeByPageAndKey(page - 2, ACTIVITY_END_TIME, formData);
  const dayEndTime = selectTimeByPageAndKey(1, DAY_END_TIME, formData);

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

  // current page already contains form data
  if (Object.keys(pagedData).includes(psk) && prevEndTime.isValid) {
    const formattedTime = prevEndTime.toLocaleString(DateTime.TIME_24_SIMPLE);
    const sectionData = pagedData[psk];

    // current page contains followup questions for selected primary activity
    if (Object.keys(sectionData).includes(HAS_FOLLOWUP_QUESTIONS)) {
      set(formRef, ['current', 'state', 'formData', psk, ACTIVITY_END_TIME], formattedTime);
    }

    // current page is night activity page
    else if (!Object.keys(sectionData).includes(SLEEP_ARRANGEMENT)) {
      set(formRef, ['current', 'state', 'formData', psk, ACTIVITY_START_TIME], formattedTime);
    }
  }
};

const schemaHasFollowupQuestions = (schema :Object, page :number) => {
  const psk = getPageSectionKey(page, 0);
  const { properties } = schema.properties[psk];

  return Object.keys(properties).includes(HAS_FOLLOWUP_QUESTIONS);
};

type Props = {
  pagedProps :Object;
};

const QuestionnaireForm = ({ pagedProps } :Props) => {

  const {
    formRef,
    onBack,
    onNext,
    page,
    pagedData,
    setPage,
    validateAndSubmit
  } = pagedProps;

  const formSchema = createFormSchema(pagedData, page);
  const { schema, uiSchema } = formSchema;

  const isSummaryPage = getIsSummaryPage(pagedData, page);

  const handleNext = () => {
    forceFormDataStateUpdate(formRef, pagedData, page);
    validateAndSubmit();
  };

  const onChange = ({ formData } :Object) => {

    const currentActivity = selectPrimaryActivityByPage(page, formData);
    if (currentActivity) {
      const endTimeInput = document.getElementById(`root_${getPageSectionKey(page, 0)}_endTime`);

      const label = endTimeInput?.parentNode?.parentNode?.previousSibling;
      if (label) {
        // $FlowFixMe
        label.innerHTML = `When did your child stop ${currentActivity}?`;
      }
    }
  };

  const validate = (formData, errors) => (
    applyCustomValidation(formData, errors, page)
  );

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
                <>
                  <Typography variant="body2">
                    Now, let&apos;s talk about what your child did while
                    <strong> { prevActivity } </strong> at
                    <strong> { prevEndTime.toLocaleString(DateTime.TIME_SIMPLE)}. </strong>
                  </Typography>
                  <br />
                </>
              )
            }
            <Form
                formData={pagedData}
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
            disabled={page === 0}
            onClick={onBack}>
          Back
        </Button>
        <Button
            color="primary"
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
