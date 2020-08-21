/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { Form } from 'lattice-fabricate';
import { useDispatch } from 'react-redux';

import { dataSchema, uiSchema } from './CreateStudySchemas';

import { createFormDataFromStudyEntity } from '../../../utils/FormUtils';
import { createStudy, updateStudy } from '../StudiesActions';

type Props = {
  notificationsEnabled :boolean;
  study :Map;
}
const CreateStudyForm = (props:Props, ref) => {
  const { notificationsEnabled, study } = props;

  const dispatch = useDispatch();

  const initialFormData = study ? createFormDataFromStudyEntity(dataSchema, notificationsEnabled, study) : {};

  const handleSubmit = ({ formData } :Object) => {
    if (study) {
      dispatch(updateStudy({ formData, initialFormData, study }));
    }
    else {
      dispatch(createStudy({ formData }));
    }
  };

  return (
    <Form
        hideSubmit
        formData={initialFormData}
        noPadding
        onSubmit={handleSubmit}
        ref={ref}
        schema={dataSchema}
        uiSchema={uiSchema} />
  );
};

// $FlowFixMe
export default React.memo<Props, typeof Form>(
  React.forwardRef(CreateStudyForm)
);
