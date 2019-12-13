// @flow
import React, { useState } from 'react';

import { Models } from 'lattice';
import { EditButton } from 'lattice-ui-kit';

import EditStudyDetailForm from './EditStudyDetailForm';

const { FullyQualifiedName } = Models;


type Props = {
  propertyFqn :FullyQualifiedName;
  value :string;
};

const EditableDetail = (props :Props) => {
  const [editMode, toggleEditMode] = useState(false);
  const { value, propertyFqn } = props;

  if (editMode) {
    return (
      <EditStudyDetailForm handleCancelEdit={() => toggleEditMode(false)} propertyFqn={propertyFqn} />
    );
  }

  return (
    <p style={{ marginTop: '5px', 'word-break': 'break-all' }}>
      <EditButton style={{ float: 'right' }} onClick={() => toggleEditMode(!editMode)} />
      { value }
    </p>
  );
};

export default EditableDetail;
