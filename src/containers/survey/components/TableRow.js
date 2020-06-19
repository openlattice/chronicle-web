// @flow
import React from 'react';

import styled from 'styled-components';
import { Set, get, getIn } from 'immutable';
import { Checkbox, Colors } from 'lattice-ui-kit';

import AppUserTypes from '../../../utils/constants/AppUserTypes';
import TableDataDispatch from '../utils/TableDataDispatch';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { updateAppUserType } from '../SurveyActions';

const { USER_FQN, TITLE_FQN } = PROPERTY_TYPE_FQNS;
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
  font-weight: 400;
  overflow: hidden;
  padding: 0 5px;
  font-size: 14px;
`;
/* stylelint-enable */

const StyledCell = styled.td`
  padding: 5px 5px;
  word-wrap: break-word;
  text-align: ${(props) => props.textAlign};
`;

// function reducer(state, action) {
//   const { entityId, usertypeId } = action;
//   console.log(entityId, usertypeId, state);
//   switch (action.type) {
//     case UDPATE_APP_USER:
//       return state;
//     default:
//       return state;
//   }
// }

type Props = {
  data :Object;
};

const TableRow = ({ data } :Props) => {
  const dispatch = React.useContext(TableDataDispatch);

  const appName :string = getIn(data, ['entityDetails', TITLE_FQN, 0]);
  const appEntityId :UUID = get(data, 'id');
  const appUsers :Set = getIn(data, ['associationDetails', USER_FQN], Set());

  const handleOnChange = (event :SyntheticInputEvent<HTMLInputElement>) => {

    const { currentTarget } = event;
    const { dataset } = currentTarget;

    const { usertypeId, entityId } = dataset;
    dispatch(updateAppUserType(usertypeId, entityId));
  };

  return (
    <RowWrapper onClick={() => {}}>
      <StyledCell textAlign="left">
        <CellContent>
          { appName }
        </CellContent>
      </StyledCell>
      <StyledCell textAlign="center">
        <Checkbox
            checked={appUsers.includes(PARENT)}
            data-entity-id={appEntityId}
            data-usertype-id={PARENT}
            onChange={handleOnChange} />
      </StyledCell>
      <StyledCell textAlign="center">
        <Checkbox
            checked={appUsers.includes(CHILD)}
            data-entity-id={appEntityId}
            data-usertype-id={CHILD}
            onChange={handleOnChange} />
      </StyledCell>
      <StyledCell textAlign="center">
        <Checkbox
            checked={appUsers.includes(PARENT_AND_CHILD)}
            data-entity-id={appEntityId}
            data-usertype-id={PARENT_AND_CHILD}
            onChange={handleOnChange} />
      </StyledCell>
    </RowWrapper>
  );
};

export default TableRow;
