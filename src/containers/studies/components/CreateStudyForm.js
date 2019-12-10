/*
 * @flow
 */

import React from 'react';

import { Form } from 'lattice-fabricate';

import { dataSchema, uiSchema } from './CreateStudySchemas';

type Props = {
  formData :Object;
  handleOnChange :Function;
  isSubmitting :boolean;
}

const CreateStudyForm = ({ formData, handleOnChange, isSubmitting } :Props) => (
  <Form
      formData={formData}
      hideSubmit
      isSubmitting={isSubmitting}
      onChange={handleOnChange}
      schema={dataSchema}
      uiSchema={uiSchema} />
);

export default CreateStudyForm;
