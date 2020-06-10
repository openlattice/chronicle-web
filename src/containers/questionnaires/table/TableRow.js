// @flow

import React from 'react';

import styled from 'styled-components';
import {
  Colors,
  Tag
} from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import StyledRow from './StyledRow';
import { TABLE_ROW_ACTIONS } from '../constants/constants';

const { NEUTRALS } = Colors;

const StyledCell = styled.td`
  padding-left: 30px;
  padding-top: 20px;
  padding-bottom: 20px;

  :last-child {
    padding-right: 30px;
  }
`;

const Description = styled(StyledCell)`
  h3 {
    padding: 0;
    margin: 0 0 5px 0;
    font-weight: 500;
  }

  p {
    padding: 0;
    margin: 0;
    font-size: 14px;
    color: ${NEUTRALS[1]};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fit, 10px);
  height: 100%;
`;

type Props = {
  data :Object
}
const TableRow = ({ data } :Props) => {
  const { title, description, status } = data;
  return (
    <StyledRow>
      <Description>
        <h3>
          { title }
        </h3>
        <p>
          { description }
        </p>
      </Description>
      <StyledCell>
        <Tag mode={status === 'active' ? 'primary' : 'default'}>
          { status }
        </Tag>
      </StyledCell>
      <StyledCell>
        <IconGrid>
          {
            TABLE_ROW_ACTIONS.map((action) => (
              <FontAwesomeIcon key={action.action} color={NEUTRALS[1]} icon={action.icon} />
            ))
          }
        </IconGrid>
      </StyledCell>
    </StyledRow>
  );
};

export default TableRow;
