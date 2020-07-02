// @flow

import styled from 'styled-components';
import { Colors, StyleUtils } from 'lattice-ui-kit';

const { WHITE, NEUTRALS } = Colors;
const { getStickyPosition } = StyleUtils;

const StyledRow = styled.tr`
  background-color: ${WHITE};
  border-bottom: 1px solid ${NEUTRALS[3]};
  font-size: 14px;
  padding: 20px 34px;

  :last-child {
    border-bottom: none;
  }

  td,
  th {
    ${getStickyPosition}
  }

  &:hover {
    cursor: pointer;
  }
`;

export default StyledRow;
