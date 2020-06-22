// @flow

import React from 'react';

import styled from 'styled-components';
import { Form } from 'lattice-fabricate';
import { Modal, Button } from 'lattice-ui-kit';

import { createSchema, getSchemaProperties, getUiSchemaOptions } from '../../questionnaire/utils';
import { createPreviewQuestionEntities } from '../utils';

const Title = styled.h4`
  font-size: 20px;
  font-weight: 400;
  margin: 0;
  padding: 0;
`;

const Description = styled.h6`
  font-size: 16px;
  font-weight: 400;
  padding: 0;
  margin: 5px 0 20px 0;
`;

type Props = {
  formData :Object;
  isVisible :boolean;
  onClose :() => void;
  title :string;
  description :string;
};

const QuestionnairePreview = ({
  description,
  formData,
  isVisible,
  onClose,
  title
} :Props) => {
  const questionEntities = createPreviewQuestionEntities(formData);
  const schemaProperties = getSchemaProperties(questionEntities);

  const uiSchemaOptions = getUiSchemaOptions(schemaProperties);
  const { schema, uiSchema } = createSchema(schemaProperties, uiSchemaOptions);
  return (
    <Modal isVisible={isVisible} onClose={onClose} textTitle="Questionnaire Preview">
      <div style={{ paddingBottom: '20px' }}>
        <Title>
          { title }
        </Title>
        <Description>
          { description }
        </Description>
        <Form
            hideSubmit
            noPadding
            schema={schema}
            uiSchema={uiSchema} />
        <div style={{ marginTop: '20px' }}>
          <Button disabled>
            Submit
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QuestionnairePreview;
