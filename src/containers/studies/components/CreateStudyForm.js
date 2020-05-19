/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { Map } from 'immutable';
import { Form } from 'lattice-fabricate';
import { useDispatch } from 'react-redux';
import { v4 as uuid } from 'uuid';

import { dataSchema, uiSchema } from './CreateStudySchemas';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { createFormDataFromStudyEntity } from '../../../utils/FormUtils';
import { createStudy, updateStudy } from '../StudiesActions';

const { STUDY_ID } = PROPERTY_TYPE_FQNS;

type Props = {
  notificationsEnabled :boolean;
  study :Map;
}
const CreateStudyForm = (props:Props, ref) => {
  const { notificationsEnabled, study } = props;

  const dispatch = useDispatch();
  const [initialFormData, setInitialFormData] = useState({});

  let studyId = uuid();
  if (study) {
    studyId = study.getIn([STUDY_ID, 0]);
  }

  useEffect(() => {
    if (study) {
      const formData :Object = createFormDataFromStudyEntity(dataSchema, notificationsEnabled, study);
      setInitialFormData(formData);
    }
  }, [study, notificationsEnabled]);

  const handleSubmit = ({ formData } :Object) => {
    if (study) {
      dispatch(updateStudy({ formData, initialFormData, study }));
    }
    else {
      dispatch(createStudy({ formData, studyId }));
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
