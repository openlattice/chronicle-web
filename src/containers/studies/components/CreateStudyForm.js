/*
 * @flow
 */

import React, { useCallback, useEffect, useState } from 'react';

import { Map } from 'immutable';
import { Constants } from 'lattice';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { useDispatch } from 'react-redux';

import { dataSchema, uiSchema } from './CreateStudySchemas';

import { ENTITY_SET_NAMES } from '../../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { createStudy } from '../StudiesActions';

const { getEntityAddressKey, getPageSectionKey } = DataProcessingUtils;

const { OPENLATTICE_ID_FQN } = Constants;

const {
  STUDY_DESCRIPTION,
  STUDY_EMAIL,
  STUDY_GROUP,
  STUDY_ID,
  STUDY_NAME,
  STUDY_VERSION
} = PROPERTY_TYPE_FQNS;
const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;


type Props = {
  editMode :boolean;
  study :Map;
}
const CreateStudyForm = (props:Props, ref) => {
  const { editMode, study } = props;

  const dispatch = useDispatch();

  const getInitialFormData = useCallback(() => {
    const psk = getPageSectionKey(1, 1);
    const studyDescriptionEAK = getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_DESCRIPTION);
    const studyEmailEAK = getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_EMAIL);
    const studyEntityKeyIdEAK = getEntityAddressKey(0, CHRONICLE_STUDIES, OPENLATTICE_ID_FQN);
    const studyGroupEAK = getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_GROUP);
    const studyIdEAK = getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID);
    const studyNameEAK = getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_NAME);
    const studyVersionEAK = getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_VERSION);

    const formData = {
      [psk]: {
        [studyDescriptionEAK]: study.getIn([STUDY_DESCRIPTION, 0]),
        [studyEmailEAK]: study.getIn([STUDY_EMAIL, 0]),
        [studyEntityKeyIdEAK]: study.getIn([OPENLATTICE_ID_FQN, 0]),
        [studyGroupEAK]: study.getIn([STUDY_GROUP, 0]),
        [studyIdEAK]: study.getIn([STUDY_ID, 0]),
        [studyNameEAK]: study.getIn([STUDY_NAME, 0]),
        [studyVersionEAK]: study.getIn([STUDY_VERSION, 0]),
      }
    };
    return formData;
  }, [study]);

  const [initialFormData, setInitialFormData] = useState({});

  useEffect(() => {
    if (editMode) {
      const formData :Object = getInitialFormData();
      setInitialFormData(formData);
    }
  }, [editMode, getInitialFormData, study]);

  const handleSubmit = ({ formData } :Object) => {
    dispatch(createStudy(formData));
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
