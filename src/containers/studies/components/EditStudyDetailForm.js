// @flow

import React from 'react';

import styled from 'styled-components';
import { Models } from 'lattice';
import { Form } from 'lattice-fabricate';
import { Colors } from 'lattice-ui-kit';

import getFormSchema from './EditStudyDetailSchema';

const { FullyQualifiedName } = Models;
const { NEUTRALS } = Colors;

type Props = {
  handleCancelEdit :() => void,
  propertyFqn :FullyQualifiedName
}
const FormWrapper = styled(Form)`
  background-color: white;
  border: solid 1px ${NEUTRALS[4]};
`;
const EditStudyDetailForm = (props :Props) => {

  const { propertyFqn, handleCancelEdit } = props;
  // $FlowFixMe
  const { uiSchema, dataSchema } = getFormSchema(propertyFqn);
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
