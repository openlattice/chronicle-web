// @flow

import React from 'react';
import { List } from 'immutable';
import {
  Card,
  CardSegment
} from 'lattice-ui-kit';
import { Form } from 'lattice-fabricate';

import {
  getSchemaProperties,
  getUiSchemaOptions,
} from '../utils/utils';
import createSchema from '../utils/formSchema';

type Props = {
  questions :List,
  studyId :UUID
}
const QuestionnaireForm = (props :Props) => {
  const { questions, studyId } = props;

  const schemaProperties = getSchemaProperties(questions, studyId);
  const uiSchemaOptions = getUiSchemaOptions(schemaProperties);
  const { schema, uiSchema } = createSchema(schemaProperties, uiSchemaOptions);


  const handleSubmit = ({ formData } :Object) => {
    console.log(formData);
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
            onSubmit={handleSubmit}
            schema={schema}
            transformErrors={transformErrors}
            uiSchema={uiSchema} />
      </CardSegment>
    </Card>
  );
};

export default QuestionnaireForm;
