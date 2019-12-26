/*
 * @flow
 */

import React from 'react';

import { Form } from 'lattice-fabricate';
import { useDispatch } from 'react-redux';

import { dataSchema, uiSchema } from './CreateStudySchemas';

import { createStudy } from '../StudiesActions';

const CreateStudyForm = (props, ref) => {

  const dispatch = useDispatch();

  const handleSubmit = ({ formData } :Object) => {
    dispatch(createStudy(formData));
  };

  return (
    <Form
        hideSubmit
        noPadding
        onSubmit={handleSubmit}
        ref={ref}
        schema={dataSchema}
        uiSchema={uiSchema} />
  );
};

// $FlowFixMe
export default React.forwardRef(CreateStudyForm);
