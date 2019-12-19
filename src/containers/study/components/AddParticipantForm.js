// @flow

import React from 'react';

import { Map, fromJS } from 'immutable';
import { Constants } from 'lattice';
import { DataProcessingUtils, Form } from 'lattice-fabricate';
import { useDispatch, useSelector } from 'react-redux';
import { addStudyParticipant } from '../../studies/StudiesActions';
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
const { processAssociationEntityData, processEntityData } = DataProcessingUtils;

type Props = {
  study :Map
}
const AddParticipantForm = (props :Props, ref) => {
  const { study } = props;
  const dispatch = useDispatch();

  const studyId = study.getIn([STUDY_ID, 0]);
  const studyEntityKeyId = study.getIn([OPENLATTICE_ID_FQN, 0]);

  let entitySetIds :Map = useSelector((store :Map) => store.getIn(['edm', 'entitySetIds']));
  const participantsEntitySetIds :Map = useSelector(
    (store :Map) => store.getIn(['studies', 'participantEntitySetIds'])
  );
  entitySetIds = entitySetIds.merge(participantsEntitySetIds);
  const propertyTypeIds :Map = useSelector((store :Map) => store.getIn(['edm', 'propertyTypesFqnIdMap']));

  const { dataSchema, uiSchema } = getFormSchema(studyId);

  const handleSubmit = (payload :any) => {

    const { formData: newFormData } = payload;
    // associations: participant => study
    const associations = [
      [PARTICIPATED_IN, 0, `${PARTICIPANTS_PREFIX}${studyId}`, studyEntityKeyId, CHRONICLE_STUDIES, {}]
    ];

    const entityData = processEntityData(newFormData, entitySetIds, propertyTypeIds);
    const associationEntityData = processAssociationEntityData(fromJS(associations), entitySetIds, propertyTypeIds);

    dispatch(
      addStudyParticipant({ entityData, associationEntityData })
    );
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

// $FlowFixMe
export default React.forwardRef(AddParticipantForm);
