// @flow
import React, { useState } from 'react';
import styled from 'styled-components';
import type { FQN } from 'lattice';
import { EditButton } from 'lattice-ui-kit';

import EditStudyDetailForm from './EditStudyDetailForm';

type Props = {
  propertyFqn :FQN;
  value :string;
};

const Container = styled.div`
  align-items: center;
  display: flex;
`;

const EditButtonWrapper = styled(EditButton)`
  margin-left: 10px;
`;

const EditableDetail = (props :Props) => {
  const { propertyFqn, value } = props;
  const [editMode, toggleEditMode] = useState(false);

  if (editMode) {
    return (
      <EditStudyDetailForm
          handleCancelEdit={() => toggleEditMode(false)}
          propertyFqn={propertyFqn} />
    );
  }

  return (
    <Container>
      { value }
      <EditButtonWrapper onClick={() => toggleEditMode(!editMode)} />
    </Container>
  );
};

export default EditableDetail;
