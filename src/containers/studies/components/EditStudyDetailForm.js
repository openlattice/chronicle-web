// @flow

import React from 'react';
import { Form } from 'lattice-fabricate';
import { Models } from 'lattice';
import getFormSchema from './EditStudyDetailSchema';

const { FullyQualifiedName } = Models;

type Props = {
  propertyFqn :FullyQualifiedName
}
const EditStudyDetailForm = (props :Props) => {

  const { propertyFqn } = props;
  // $FlowFixMe
  const { uiSchema, dataSchema } = getFormSchema(propertyFqn);
  const handleSubmit = () => {

  };
  return (
    <Form
        onSubmit={handleSubmit}
        noPadding
        schema={dataSchema}
        uiSchema={uiSchema} />
  );
};

export default EditStudyDetailForm;
