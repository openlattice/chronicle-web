// @flow

import React from 'react';

import { Map } from 'immutable';
import { Constants } from 'lattice';
import { Form } from 'lattice-fabricate';
import { useDispatch } from 'react-redux';

import { dataSchema, uiSchema } from './AddParticipantSchema';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { validateAddParticipantForm } from '../../../utils/FormUtils';
import { addStudyParticipant } from '../../studies/StudiesActions';

const { STUDY_ID } = PROPERTY_TYPE_FQNS;
const { OPENLATTICE_ID_FQN } = Constants;

type Props = {
  participants :Map;
  study :Map;
}
const AddParticipantForm = (props :Props, ref) => {
  const { participants, study } = props;
  const dispatch = useDispatch();

  const handleSubmit = ({ formData }:Object) => {
    dispatch(addStudyParticipant({
      formData,
      studyEntityKeyId: study.getIn([OPENLATTICE_ID_FQN, 0]),
      studyId: study.getIn([STUDY_ID, 0])
    }));
  };

  const validate = (formData, errors) => (
    validateAddParticipantForm(formData, errors, participants)
  );

  return (
    <Form
        hideSubmit
        onSubmit={handleSubmit}
        ref={ref}
        noPadding
        schema={dataSchema}
        uiSchema={uiSchema}
        validate={validate} />
  );
};

// $FlowFixMe
export default React.forwardRef(AddParticipantForm);
