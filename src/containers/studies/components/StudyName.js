/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { EditButton } from 'lattice-ui-kit';

import EditStudyDetailForm from './EditStudyDetailForm';

import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { STUDY_NAME } = PROPERTY_TYPE_FQNS;
// const { NEUTRALS } = Colors;
const Container = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0 30px 0;

  > h1 {
    font-size: 28px;
    font-weight: normal;
    margin: 0 10px 0 0;
    padding: 0;
  }
`;

const FormWrapper = styled.div`
  width: 100%;
`;

type Props = {
  studyName :string,
};

const StudyName = ({ studyName } :Props) => {
  const [editMode, toggleEdit] = useState(false);

  useEffect(() => {
    // remove this later
  });

  return (
    <Container>
      {
        editMode
          ? (
            <FormWrapper>
              <EditStudyDetailForm propertyFqn={STUDY_NAME} />
            </FormWrapper>
          ) : (

            <h1>
              {studyName}
            </h1>
          )
      }
      <EditButton onClick={() => toggleEdit(!editMode)} />
    </Container>
  );
};

export default StudyName;
