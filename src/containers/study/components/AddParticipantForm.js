// @flow

import React from 'react';

import { Map, fromJS } from 'immutable';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { useSelector } from 'react-redux';

import getFormSchema from './AddParticipantSchema';

import {
  ASSOCIATION_ENTITY_SET_NAMES,
  ENTITY_SET_NAMES,
  PARTICIPANTS_PREFIX
} from '../../../core/edm/constants/EntitySetNames';


const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const { PARTICIPATED_IN } = ASSOCIATION_ENTITY_SET_NAMES;
const { processEntityData, processAssociationEntityData } = DataProcessingUtils;

type Props = {
  studyId :string
}
const AddParticipantForm = (props :Props, ref) => {
  const { studyId } = props;
  const entitySetIds :Map = useSelector((store :Map) => store.getIn(['edm', 'entitySetIds']));
  const propertyTypeIds :Map = useSelector((store :Map) => store.getIn(['edm', 'propertyTypesFqnIdMap']));
  const { dataSchema, uiSchema } = getFormSchema(studyId);
  const handleSubmit = (payload :any) => {
    const { formData: newFormData } = payload;

    // assocations: participant -> study Id
    // need to create a new entity set
    const associations = [
      [PARTICIPATED_IN, 0, `${PARTICIPANTS_PREFIX}${studyId}`, studyId, CHRONICLE_STUDIES, {}]
    ];

    const entityData = processEntityData(newFormData, entitySetIds, propertyTypeIds);
    const assocationEntityData = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);

    console.log(entityData);
    console.log(assocationEntityData);

  };

  return (
    <Form
        hideSubmit
        onSubmit={handleSubmit}
        ref={ref}
        schema={dataSchema}
        uiSchema={uiSchema} />
  );
};

export default React.memo<Props, typeof Form>(
  React.forwardRef(AddParticipantForm)
);
