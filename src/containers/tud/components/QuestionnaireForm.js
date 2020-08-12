// @flow

import React from 'react';

import styled from 'styled-components';
import { DataProcessingUtils, Form, Paged } from 'lattice-fabricate';
import {
  Button,
  Card,
  CardSegment,
} from 'lattice-ui-kit';

import TimeUseSummary from './TimeUseSummary';

import * as DaySpanSchema from '../schemas/DaySpanSchema';
import * as PreSurveySchema from '../schemas/PreSurveySchema';
import { PAGE_NUMBERS } from '../constants/GeneralConstants';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';
import {
  applyCustomValidation,
  createFormSchema,
  createUiSchema,
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

const QuestionnaireForm = () => (
  <Card>
    <CardSegment>
      <Paged
          render={(pagedProps) => {
            const {
              formRef,
              onBack,
              onNext,
              page,
              pagedData,
              setPage,
              validateAndSubmit
            } = pagedProps;

            let schema = createFormSchema(page, pagedData);
            let uiSchema = createUiSchema(page);

            // presurvey
            if (page === PRE_SURVEY_PAGE) {
              schema = PreSurveySchema.schema;
              uiSchema = PreSurveySchema.uiSchema;
            }

            // day span
            if (page === DAY_SPAN_PAGE) {
              schema = DaySpanSchema.schema;
              uiSchema = DaySpanSchema.uiSchema;
            }

            const handleNext = () => {
              //
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
                        label.innerHTML = `When did your child stop ${currentActivity.description}?`;
                      }
                    }
                  }
                }
              }
            };

            const validate = (formData, errors) => (
              applyCustomValidation(formData, errors, page)
            );

            const prevEndTime = selectTimeByPageAndKey(page - 1, ACTIVITY_END_TIME, pagedData);
            const dayEndTime = selectTimeByPageAndKey(1, DAY_END_TIME, pagedData);

            const lastPage = prevEndTime.isValid && dayEndTime.isValid
              && prevEndTime.equals(dayEndTime);

            return (
              <>
                {
                  lastPage ? (
                    <TimeUseSummary
                        formData={pagedData}
                        goToPage={setPage} />
                  ) : (
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
                      lastPage ? 'Submit' : 'Next'
                    }
                  </Button>
                </ButtonRow>
              </>
            );
          }} />
    </CardSegment>
  </Card>
);

export default QuestionnaireForm;
