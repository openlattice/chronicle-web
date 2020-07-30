// @flow

import React from 'react';

import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faPencilAlt } from '@fortawesome/pro-solid-svg-icons';

import { Button, Colors } from 'lattice-ui-kit';

import { createTimeUseSummary } from '../utils';

const { NEUTRAL } = Colors;

const Heading = styled.h6`
  font-size: 16px;
  font-weight: normal;
  margin-bottom: 20px;
  color: ${NEUTRAL.N900}
`;

const ItemSummary = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  grid-gap: 20px;
  align-items: center;
  font-size: 15px;
`;

const Description = styled.p`
  color: ${NEUTRAL.N600};
  margin: 0;
  padding: 0;
`;

const StyledButton = styled(Button)`
  width: 100%;
  margin-top: 10px;
`;

const Wrapper = styled.div`
  border-bottom: 1px solid ${NEUTRAL.N100};
  padding: 15px 0;
`;

type Props = {
  formData :Object;
};

const TimeUseSummary = ({ formData } :Props) => {
  const summary = createTimeUseSummary(formData);

  return (
    <div>
      <Heading>
        Here is a summary of how your child spent their day.
        Please make sure this information is correct before submitting survey.
      </Heading>
      {
        summary.map((item) => (
          <Wrapper>
            <ItemSummary key={item.time}>
              <Description>
                {item.time}
              </Description>

              <Description>
                {item.description}
              </Description>
            </ItemSummary>
            <StyledButton
                startIcon={<FontAwesomeIcon icon={faPencilAlt} />}>
              Edit
            </StyledButton>
          </Wrapper>
        ))
      }
    </div>
  );
};

export default TimeUseSummary;
