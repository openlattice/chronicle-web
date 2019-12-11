/*
 * @flow
 */

import React, { useCallback } from 'react';

import { Map } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { useDispatch, useSelector } from 'react-redux';

import { dataSchema, uiSchema } from './CreateStudySchemas';

import { ENTITY_SET_NAMES } from '../../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { createStudy } from '../StudiesActions';

const {
  STUDY_DESCRIPTION,
  STUDY_EMAIL,
  STUDY_GROUP,
  STUDY_NAME,
  STUDY_VERSION,
  STUDY_ID
} = PROPERTY_TYPE_FQNS;

const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const { processEntityData } = DataProcessingUtils;

type Props = {

}
const CreateStudyForm = (props :Props, ref) => {

  const allEntitySetIds :Map = useSelector((store :Map) => store.getIn(['edm', 'entitySetIds']));
  const propertyTypesFqnIdMap :Map = useSelector((store :Map) => store.getIn(['edm', 'propertyTypesFqnIdMap']));
  const dispatch = useDispatch();

  const handleSubmit = useCallback((payload :any) => {
    const { formData: newFormData } = payload;

    const propertyTypeIds = {
      [STUDY_DESCRIPTION]: propertyTypesFqnIdMap.get(STUDY_DESCRIPTION),
      [STUDY_EMAIL]: propertyTypesFqnIdMap.get(STUDY_EMAIL),
      [STUDY_GROUP]: propertyTypesFqnIdMap.get(STUDY_GROUP),
      [STUDY_NAME]: propertyTypesFqnIdMap.get(STUDY_NAME),
      [STUDY_VERSION]: propertyTypesFqnIdMap.get(STUDY_VERSION),
      [STUDY_ID]: propertyTypesFqnIdMap.get(STUDY_ID)
    };

    const entitySetIds = {
      [CHRONICLE_STUDIES]: allEntitySetIds.get(CHRONICLE_STUDIES)
    };

    const entityData = processEntityData(newFormData, entitySetIds, propertyTypeIds);
    const assocationEntityData = {};
    dispatch(createStudy({
      entityData,
      assocationEntityData
    }));
    // what studies should i charge and reduc
  });

  return (
    <Form
        noPadding
        onSubmit={handleSubmit}
        hideSubmit
        ref={ref}
        schema={dataSchema}
        uiSchema={uiSchema} />
  );
};

export default React.memo<Props, typeof Form>(
  React.forwardRef(CreateStudyForm)
);
