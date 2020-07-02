// @flow

import React, { useState } from 'react';

import styled from 'styled-components';
import { get } from 'immutable';
import { Badge, Button, Colors } from 'lattice-ui-kit';

import QuestionnairePreview from './QuestionnairePreview';

import { QUESTIONNAIRE_SUMMARY } from '../constants/constants';
import { getQuestionnaireSummaryFromForm } from '../utils';

const { NEUTRALS } = Colors;

const {
  DESCRIPTION,
  NUM_MULTIPLE_CHOICE,
  NUM_SINGLE_ANSWER,
  TITLE,
} = QUESTIONNAIRE_SUMMARY;

const StyledButton = styled(Button)`
  margin-top: 20px;
  align-self: flex-start;
`;

const LeadText = styled.span`
  font-weight: 500;
  font-size: 15px;
`;

const Description = styled.span`
  font-size: 15px;
`;

const Wrapper = styled.div`
  margin-bottom: 4px;
`;

const Title = styled.h4`
  margin-bottom: 10px;
  margin-top: 0;
`;

const Label = styled.span`
  font-size: 14px;
  color: ${NEUTRALS[1]};
`;

type Props = {
  formData :Object;
}
const NewQuestionnaireConfirmation = ({
  formData
} :Props) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const summary = getQuestionnaireSummaryFromForm(formData);

  return (
    <>
      <Title> Summary </Title>
      <Wrapper>
        <LeadText> Title: </LeadText>
        <Description>
          { get(summary, TITLE) }
        </Description>
      </Wrapper>

      <Wrapper>
        <LeadText> Description: </LeadText>
        <Description>
          { get(summary, DESCRIPTION) }
        </Description>
      </Wrapper>

      <Wrapper>
        <Badge count={get(summary, NUM_MULTIPLE_CHOICE)} />
        <Label>
          &nbsp; Multiple choice questions
        </Label>
      </Wrapper>

      <Wrapper>
        <Badge count={get(summary, NUM_SINGLE_ANSWER)} />
        <Label>
          &nbsp; Single answer questions
        </Label>
      </Wrapper>

      <StyledButton mode="secondary" onClick={() => setPreviewVisible(true)}>
        Preview
      </StyledButton>

      <QuestionnairePreview
          description={get(summary, DESCRIPTION)}
          isVisible={previewVisible}
          formData={formData}
          onClose={() => setPreviewVisible(false)}
          title={get(summary, TITLE)} />
    </>
  );
};

export default NewQuestionnaireConfirmation;
