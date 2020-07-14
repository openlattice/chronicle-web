// @flow

import React from 'react';

import styled from 'styled-components';
import { List } from 'immutable';
import { Form } from 'lattice-fabricate';
import {
  Card,
  CardSegment,
  StyleUtils
} from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { submitQuestionnaire } from '../QuestionnaireActions';
import { createSchema, getSchemaProperties, getUiSchemaOptions } from '../utils';

const { media } = StyleUtils;

const StyledCard = styled(Card)`
  ${media.phone`
    padding: 10px;
  `}
`;

const StyledCardSegment = styled(CardSegment)`
  ${media.phone`
    margin: 0 10px 0 10px;
  `}
`;

const transformErrors = (errors) => errors.map((error) => {
  if (error.name === 'required') {
    /* eslint-disable no-param-reassign */
    error.message = 'Response is required';
  }
  return error;
});

type Props = {
  participantId ?:UUID;
  questions :List;
  studyId ?:UUID;
  submitRequestState ?:RequestState;
  editable ?:boolean;
  initialFormData ?:Object;
}
const QuestionnaireForm = (props :Props) => {
  const {
    editable,
    participantId,
    questions,
    studyId,
    submitRequestState,
    initialFormData
  } = props;
  const dispatch = useDispatch();

  const schemaProperties = getSchemaProperties(questions);

  const uiSchemaOptions = getUiSchemaOptions(schemaProperties);
  const { schema, uiSchema } = createSchema(schemaProperties, uiSchemaOptions);

  const handleSubmit = ({ formData } :Object) => {
    dispatch(submitQuestionnaire({
      studyId,
      participantId,
      formData
    }));
  };

  return (
    <StyledCard>
      <StyledCardSegment noBleed>
        <Form
            disabled={!editable}
            formData={initialFormData}
            isSubmitting={submitRequestState === RequestStates.PENDING}
            noHtml5Validate
            onSubmit={handleSubmit}
            schema={schema}
            transformErrors={transformErrors}
            uiSchema={uiSchema} />
      </StyledCardSegment>
    </StyledCard>
  );
};

QuestionnaireForm.defaultProps = {
  editable: true,
  initialFormData: {},
  participantId: undefined,
  studyId: undefined,
  submitRequestState: undefined,
};

export default QuestionnaireForm;
