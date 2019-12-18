/*
 * @flow
 */

import React from 'react';

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
  getEntityAddressKey,
  getPageSectionKey,
  processEntityData,
} = DataProcessingUtils;

const CreateStudyForm = (props, ref) => {

  const allEntitySetIds :Map = useSelector((store :Map) => store.getIn(['edm', 'entitySetIds']));
  const propertyTypeIds :Map = useSelector((store :Map) => store.getIn(['edm', 'propertyTypesFqnIdMap']));
  const dispatch = useDispatch();

  const handleSubmit = (payload :any) => {
    let { formData: newStudyData } = payload;
    newStudyData = setIn(
      newStudyData,
      [getPageSectionKey(1, 1), getEntityAddressKey(0, CHRONICLE_STUDIES, STUDY_ID)], uuid()
    );

    const entityData = processEntityData(newStudyData, allEntitySetIds, propertyTypeIds);
    const associationEntityData = {};

    dispatch(createStudy({
      associationEntityData,
      entityData,
      newStudyData,
    }));
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
