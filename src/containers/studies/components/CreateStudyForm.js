/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import { Map, setIn } from 'immutable';
import { Constants } from 'lattice';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { useDispatch } from 'react-redux';

import { dataSchema, uiSchema } from './CreateStudySchemas';

import createFormDataFromStudyEntity from '../../../utils/FormUtils';
import { ENTITY_SET_NAMES } from '../../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { createStudy, updateStudy } from '../StudiesActions';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;
const { OPENLATTICE_ID_FQN } = Constants;
const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const { STUDY_ID } = PROPERTY_TYPE_FQNS;

type Props = {
  study :Map;
}
const CreateStudyForm = (props:Props, ref) => {
  const { study } = props;

  const dispatch = useDispatch();
  const [initialFormData, setInitialFormData] = useState({});

  useEffect(() => {
    if (study) {
      let formData :Object = createFormDataFromStudyEntity(dataSchema, study);

      const studyId :UUID = study.getIn([STUDY_ID, 0]);
      const studyEKID :UUID = study.getIn([OPENLATTICE_ID_FQN, 0]);

      formData = setIn(formData,
        [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID)], studyId);
      formData = setIn(formData,
        [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, OPENLATTICE_ID_FQN)], studyEKID);

      setInitialFormData(formData);
    }
  }, [study]);

  const handleSubmit = ({ formData } :Object) => {
    if (study) {
      dispatch(updateStudy({ formData, initialFormData, study }));
    }
    else {
      dispatch(createStudy(formData));
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
