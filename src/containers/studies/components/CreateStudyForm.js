/*
 * @flow
 */

import React from 'react';

import { Form } from 'lattice-fabricate';

import { dataSchema, uiSchema } from './CreateStudySchemas';


type Props = {
  formData :Object;
  isSubmitting :boolean;
}

const CreateStudyForm = ({ formData, isSubmitting } :Props) => (
  <Form
      formData={formData}
      hideSubmit
      isSubmitting={isSubmitting}
      noPadding
      schema={dataSchema}
      uiSchema={uiSchema} />
);

export default CreateStudyForm;
