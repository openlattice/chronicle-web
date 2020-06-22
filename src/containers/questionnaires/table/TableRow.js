// @flow

import React from 'react';

import styled from 'styled-components';
import {
  Colors,
  Tag
} from 'lattice-ui-kit';
import { getIn } from 'immutable';
import { faToggleOn } from '@fortawesome/pro-regular-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import StyledRow from './StyledRow';
import { TABLE_ROW_ACTIONS } from '../constants/constants';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { ACTIVE_FQN, DESCRIPTION_FQN, NAME_FQN } = PROPERTY_TYPE_FQNS;

const { NEUTRALS, PURPLES } = Colors;

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

  const active = getIn(data, [ACTIVE_FQN, 0], false);
  const activeStatus = active ? 'Active' : 'Inactive';

  return (
    <StyledRow>
      <Description>
        <h3>
          { getIn(data, [NAME_FQN, 0]) }
        </h3>
        <p>
          { getIn(data, [DESCRIPTION_FQN, 0]) }
        </p>
      </Description>
      <StyledCell>
        <Tag mode={active ? 'primary' : ''}>
          { activeStatus }
        </Tag>
      </StyledCell>
      <StyledCell>
        <IconGrid>
          {
            TABLE_ROW_ACTIONS.map((action) => (
              <FontAwesomeIcon
                  key={action.action}
                  color={action.action === 'TOGGLE_STATUS' && active ? PURPLES[0] : NEUTRALS[1]}
                  icon={action.action === 'TOGGLE_STATUS' && active ? faToggleOn : action.icon} />
            ))
          }
        </IconGrid>
      </StyledCell>
    </StyledRow>
  );
};

export default TableRow;
