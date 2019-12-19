// @flow

import React from 'react';

import styled from 'styled-components';
import { Form } from 'lattice-fabricate';
import { Colors } from 'lattice-ui-kit';
import type { FQN } from 'lattice';

import getFormSchema from './EditStudyDetailSchema';

const { NEUTRALS } = Colors;

type Props = {
  handleCancelEdit :() => void,
  propertyFqn :FQN
}

const FormWrapper = styled(Form)`
  background-color: white;
  border: solid 1px ${NEUTRALS[4]};
`;

const EditStudyDetailForm = (props :Props) => {

  const { handleCancelEdit, propertyFqn } = props;
  // $FlowFixMe
  const { dataSchema, uiSchema } = getFormSchema(propertyFqn);
  const handleSubmit = () => {};

  return (
    <FormWrapper
        onDiscard={handleCancelEdit}
        onSubmit={handleSubmit}
        schema={dataSchema}
        uiSchema={uiSchema} />
  );

};

export default EditStudyDetailForm;