// @flow
import React from 'react';
import { Colors, Checkbox } from 'lattice-ui-kit';
import styled from 'styled-components';

const { NEUTRALS } = Colors;

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
};

const TableRow = ({ data } :Props) => {
  return (
    <>
      <RowWrapper onClick={() => {}}>
        <StyledCell textAlign="left">
          <CellContent>
            {data.app_name}
          </CellContent>
        </StyledCell>
        <StyledCell textAlign="center">
          <Checkbox />
        </StyledCell>
        <StyledCell textAlign="center">
          <Checkbox />
        </StyledCell>
        <StyledCell textAlign="center">
          <Checkbox />
        </StyledCell>
      </RowWrapper>
    </>
  );
};

export default TableRow;
