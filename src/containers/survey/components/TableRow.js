// @flow
import React from 'react';

import styled from 'styled-components';
import { get, Set, getIn } from 'immutable';
import { Checkbox, Colors } from 'lattice-ui-kit';

import AppUserTypes from '../../../utils/constants/AppUserTypes';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { PERSON_ID, TITLE } = PROPERTY_TYPE_FQNS;
const { NEUTRALS } = Colors;
const { CHILD, PARENT, PARENT_AND_CHILD } = AppUserTypes;

const RowWrapper = styled.tr.attrs(() => ({ tabIndex: '1' }))`
  border-bottom: 1px solid ${NEUTRALS[6]};

  :focus {
    outline: none;
  }

  :hover {
    background-color: ${NEUTRALS[10]};
  }
`;

/* stylelint-disable value-no-vendor-prefix, property-no-vendor-prefix */
const CellContent = styled.div`
  -webkit-line-clamp: 2;
  display: -webkit-box;
  font-size: 15px;
  font-weight: 400;
  overflow: hidden;
  padding: 0 5px;
`;
/* stylelint-enable */

const StyledCell = styled.td`
  padding: 5px 5px;
  word-wrap: break-word;
  text-align: ${(props) => props.textAlign};
`;

type Props = {
  data :Object;
  handleOnChange :(SyntheticInputEvent<HTMLInputElement>) => void;
};

const TableRow = ({ data, handleOnChange } :Props) => {
  const appName :string = getIn(data, ['neighborDetails', TITLE]);
  const neighborId :UUID = get(data, 'neighborId');
  const appUsers = getIn(data, ['associationDetails', PERSON_ID.toString()], Set());

  return (
    <>
      <RowWrapper onClick={() => {}}>
        <StyledCell textAlign="left">
          <CellContent>
            { appName }
          </CellContent>
        </StyledCell>
        <StyledCell textAlign="center">
          <Checkbox
              checked={appUsers.includes(PARENT)}
              data-neighbor-id={neighborId}
              data-usertype-id={PARENT}
              onChange={handleOnChange} />
        </StyledCell>
        <StyledCell textAlign="center">
          <Checkbox
              checked={appUsers.includes(CHILD)}
              data-neighbor-id={neighborId}
              data-usertype-id={CHILD}
              onChange={handleOnChange} />
        </StyledCell>
        <StyledCell textAlign="center">
          <Checkbox
              checked={appUsers.includes(PARENT_AND_CHILD)}
              data-neighbor-id={neighborId}
              data-usertype-id={PARENT_AND_CHILD}
              onChange={handleOnChange} />
        </StyledCell>
      </RowWrapper>
    </>
  );
};

export default TableRow;
