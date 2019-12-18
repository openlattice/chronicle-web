/*
 * @flow
 */

import React, { useCallback } from 'react';

import uuid from 'uuid/v4';
import { Map, setIn } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { useDispatch, useSelector } from 'react-redux';

import { dataSchema, uiSchema } from './CreateStudySchemas';

import { ENTITY_SET_NAMES } from '../../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { createStudy } from '../StudiesActions';

const { STUDY_ID } = PROPERTY_TYPE_FQNS;
const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const {
  processEntityData,
  getEntityAddressKey,
  getPageSectionKey
} = DataProcessingUtils;

type Props = {
};

const CreateStudyForm = (props :Props, ref) => {

  const allEntitySetIds :Map = useSelector((store :Map) => store.getIn(['edm', 'entitySetIds']));
  const propertyTypeIds :Map = useSelector((store :Map) => store.getIn(['edm', 'propertyTypesFqnIdMap']));
  const dispatch = useDispatch();

  const handleSubmit = useCallback((payload :any) => {
    let { formData: newStudyData } = payload;
    newStudyData = setIn(newStudyData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID)], uuid());

    const entityData = processEntityData(newStudyData, allEntitySetIds, propertyTypeIds);
    const assocationEntityData = {};

    dispatch(createStudy({
      entityData,
      assocationEntityData,
      newStudyData
    }));
  });

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

export default React.memo<Props, typeof Form>(
  React.forwardRef(CreateStudyForm)
);
