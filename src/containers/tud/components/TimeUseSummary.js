// @flow

import React from 'react';

import styled from 'styled-components';
import { faPencilAlt } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Colors } from 'lattice-ui-kit';

import { createTimeUseSummary } from '../utils';

const { NEUTRAL } = Colors;

const Heading = styled.h6`
  color: ${NEUTRAL.N900};
  font-size: 16px;
  font-weight: normal;
  margin-bottom: 20px;
`;

const ItemSummary = styled.div`
  align-items: center;
  display: grid;
  font-size: 15px;
  grid-gap: 20px;
  grid-template-columns: 100px 1fr;
`;

const Description = styled.p`
  color: ${NEUTRAL.N600};
  margin: 0;
  padding: 0;
`;

const StyledButton = styled(Button)`
  margin-top: 10px;
  width: 100%;
`;

const Wrapper = styled.div`
  border-bottom: 1px solid ${NEUTRAL.N100};
  padding: 20px 0;
`;

type Props = {
  formData :Object;
  goToPage :(pageNum :number) => void;
};

const TimeUseSummary = ({ formData, goToPage } :Props) => {
  const summary = createTimeUseSummary(formData);

  return (
    <div>
      <Heading>
        Here is a summary of how your child spent their day.
        Please make sure this information is correct before submitting survey.
      </Heading>
      {
        summary.map((item) => (
          <Wrapper key={item.time}>
            <ItemSummary>
              <Description>
                {item.time}
              </Description>

              <Description>
                {item.description}
              </Description>
            </ItemSummary>
            <StyledButton
                onClick={() => goToPage(item.pageNum)}
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
