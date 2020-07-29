// @flow

import React from 'react';

import styled from 'styled-components';
import { DataProcessingUtils, Form, Paged } from 'lattice-fabricate';
import {
  Button,
  Card,
  CardSegment,
} from 'lattice-ui-kit';

import * as DaySpanSchema from '../schemas/DaySpanSchema';
import * as PreSurveySchema from '../schemas/PreSurveySchema';
import {
  applyCustomValidation,
  createFormSchema,
  createUiSchema,
  selectPrimaryActivityByPage
} from '../utils';

const { getPageSectionKey } = DataProcessingUtils;

const ButtonRow = styled.div`
  display: flex;
  align-items: center;
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
              validateAndSubmit
            } = pagedProps;

            let schema = createFormSchema(page, pagedData);
            let uiSchema = createUiSchema(page);

            // presurvey
            if (page === 0) {
              schema = PreSurveySchema.schema;
              uiSchema = PreSurveySchema.uiSchema;
            }

            // day span
            if (page === 1) {
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

            return (
              <>
                <Form
                    formData={pagedData}
                    ref={formRef}
                    hideSubmit
                    onChange={onChange}
                    onSubmit={onNext}
                    noPadding
                    schema={schema}
                    uiSchema={uiSchema}
                    validate={validate} />

                <ButtonRow>
                  <Button
                      disabled={page === 0}
                      onClick={onBack}>
                    Back
                  </Button>
                  <Button
                      color="primary"
                      onClick={handleNext}>
                    Next
                  </Button>
                </ButtonRow>
              </>
            );
          }} />
    </CardSegment>
  </Card>
);

export default QuestionnaireForm;
