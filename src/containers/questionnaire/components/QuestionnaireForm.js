// @flow

import React from 'react';

import { List } from 'immutable';
import { Form } from 'lattice-fabricate';
import {
  Card,
  CardSegment
} from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import createSchema from '../utils/formSchema';
import { submitQuestionnaire } from '../QuestionnaireActions';
import { getSchemaProperties, getUiSchemaOptions } from '../utils/utils';

type Props = {
  participantId :UUID;
  questions :List;
  studyId :UUID;
  submitRequestState :RequestState
}
const QuestionnaireForm = (props :Props) => {
  const {
    participantId,
    questions,
    studyId,
    submitRequestState
  } = props;
  const dispatch = useDispatch();

  const schemaProperties = getSchemaProperties(questions, studyId);
  const uiSchemaOptions = getUiSchemaOptions(schemaProperties);
  const { schema, uiSchema } = createSchema(schemaProperties, uiSchemaOptions);


  const handleSubmit = ({ formData } :Object) => {
    dispatch(submitQuestionnaire({
      studyId,
      participantId,
      formData
    }));
  };

  const transformErrors = (errors) => errors.map((error) => {
    if (error.name === 'required') {
      /* eslint-disable no-param-reassign */
      error.message = 'Response is required';
    }
    return error;
  });

  return (
    <Card>
      <CardSegment vertical noBleed>
        <Form
            isSubmitting={submitRequestState === RequestStates.PENDING}
            onSubmit={handleSubmit}
            noHtml5Validate
            schema={schema}
            transformErrors={transformErrors}
            uiSchema={uiSchema} />
      </CardSegment>
    </Card>
  );
};

export default QuestionnaireForm;
