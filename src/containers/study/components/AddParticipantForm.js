// @flow

import React from 'react';

import { Map, fromJS } from 'immutable';
import { Constants } from 'lattice';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { useSelector } from 'react-redux';

// temp
import getFormSchema from './AddParticipantSchema';

import {
  ASSOCIATION_ENTITY_SET_NAMES,
  ENTITY_SET_NAMES,
  PARTICIPANTS_PREFIX
} from '../../../core/edm/constants/EntitySetNames';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { OPENLATTICE_ID_FQN } = Constants;
const { STUDY_ID } = PROPERTY_TYPE_FQNS;
const { CHRONICLE_STUDIES } = ENTITY_SET_NAMES;
const { PARTICIPATED_IN } = ASSOCIATION_ENTITY_SET_NAMES;
const { processEntityData, processAssociationEntityData } = DataProcessingUtils;

type Props = {
  study :Map
}
const AddParticipantForm = (props :Props, ref) => {
  const { study } = props;

  const studyId = study.getIn([STUDY_ID, 0]);
  const studyEntityKeyId = study.getIn([OPENLATTICE_ID_FQN, 0]);

  const entitySetIds :Map = useSelector((store :Map) => store.getIn(['edm', 'entitySetIds']));
  const propertyTypeIds :Map = useSelector((store :Map) => store.getIn(['edm', 'propertyTypesFqnIdMap']));

  const { dataSchema, uiSchema } = getFormSchema(studyId);

  const handleSubmit = (payload :any) => {
    const { formData: newFormData } = payload;
    // console.log(newFormData);
    const associations = [
      [PARTICIPATED_IN, 0, `${PARTICIPANTS_PREFIX}${studyId}`, studyEntityKeyId, CHRONICLE_STUDIES, {}]
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
