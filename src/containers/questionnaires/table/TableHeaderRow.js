// @flow

import React from 'react';

import StyledRow from './StyledRow';

type Props = {
  components :Object;
  className ?:string;
  headers :Object[];
}

const TableHeaderRow = ({
  components,
  className,
  headers
} :Props) => (
  <thead className={className}>
    <StyledRow sticky>
      {
        headers.map((header) => (
          <components.HeadCell
              key={header.key}
              width={header.key} />
        ))
      }
    </StyledRow>
  </thead>
);

TableHeaderRow.defaultProps = {
  className: undefined
};

export default TableHeaderRow;
