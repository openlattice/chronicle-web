// @flow

import React from 'react';

import cloneDeep from 'lodash/cloneDeep';
import styled from 'styled-components';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { Button } from 'lattice-ui-kit';

import TimeUseSummary from './TimeUseSummary';

import * as DaySpanSchema from '../schemas/DaySpanSchema';
import * as PreSurveySchema from '../schemas/PreSurveySchema';
import { PAGE_NUMBERS } from '../constants/GeneralConstants';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';
import {
  activityRequiresFollowup,
  applyCustomValidation,
  createFormSchema,
  pageHasFollowupQuestions,
  selectPrimaryActivityByPage,
  selectTimeByPageAndKey
} from '../utils';

const { getPageSectionKey } = DataProcessingUtils;
const { ACTIVITY_END_TIME, DAY_END_TIME } = PROPERTY_CONSTS;

const { DAY_SPAN_PAGE, PRE_SURVEY_PAGE } = PAGE_NUMBERS;

const ButtonRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;

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

  let schema;
  let uiSchema;

  if (page === PRE_SURVEY_PAGE) {
    schema = cloneDeep(PreSurveySchema.schema);
    uiSchema = cloneDeep(PreSurveySchema.uiSchema);
  }
  else if (page === DAY_SPAN_PAGE) {
    schema = cloneDeep(DaySpanSchema.schema);
    uiSchema = cloneDeep(DaySpanSchema.uiSchema);
  }
  else {
    const formSchema = createFormSchema(page, pagedData);
    schema = formSchema.schema;
    uiSchema = formSchema.uiSchema;
  }

  const handleNext = () => {
    validateAndSubmit();
  };

  const onChange = ({ formData } :Object) => {

    const currentActivity = selectPrimaryActivityByPage(page, formData);
    if (currentActivity) {
      const endTimeInput = document.getElementById(`root_${getPageSectionKey(page, 0)}_endTime`);

      if (endTimeInput) {
        let parent = endTimeInput.parentNode;
        if (parent) {
          parent = parent.parentNode;
          if (parent) {
            const label = parent.previousSibling;
            if (label) {
              // $FlowFixMe
              label.innerHTML = `When did your child stop ${currentActivity}?`;
            }
          }
        }
      }
    }
  };

  const validate = (formData, errors) => (
    applyCustomValidation(formData, errors, page)
  );

  const prevActivity = selectPrimaryActivityByPage(page - 1, pagedData);
  const prevEndTime = selectTimeByPageAndKey(page - 1, ACTIVITY_END_TIME, pagedData);
  const dayEndTime = selectTimeByPageAndKey(1, DAY_END_TIME, pagedData);

  const isSummaryPage = prevEndTime.isValid && dayEndTime.isValid
    && prevEndTime.equals(dayEndTime)
    && (!activityRequiresFollowup(prevActivity) || pageHasFollowupQuestions(pagedData, page - 1));

  return (
    <>
      {
        isSummaryPage ? (
          <TimeUseSummary
              formData={pagedData}
              goToPage={setPage} />
        ) : (
          <Form
              formData={pagedData}
              hideSubmit
              noPadding
              onChange={onChange}
              omitExtraData={false}
              onSubmit={onNext}
              ref={formRef}
              schema={schema}
              uiSchema={uiSchema}
              validate={validate} />
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
