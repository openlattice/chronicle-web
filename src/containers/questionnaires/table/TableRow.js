// @flow

import React, { useState } from 'react';

import styled from 'styled-components';
import { faToggleOn } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getIn } from 'immutable';
import { Constants } from 'lattice';
import {
  Colors,
  Tag
} from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';

import StyledRow from './StyledRow';

import ChangeActiveStatusModal from '../components/ChangeActiveStatusModal';
import DeleteQuestionnaireModal from '../components/DeleteQuestionnaireModal';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { resetRequestState } from '../../../core/redux/ReduxActions';
import { CHANGE_ACTIVE_STATUS } from '../../questionnaire/QuestionnaireActions';
import { TABLE_ROW_ACTIONS } from '../constants/constants';

const { ACTIVE_FQN, DESCRIPTION_FQN, NAME_FQN } = PROPERTY_TYPE_FQNS;
const { OPENLATTICE_ID_FQN } = Constants;
const { NEUTRALS, PURPLES } = Colors;

const [DELETE, TOGGLE_STATUS] = TABLE_ROW_ACTIONS.map((action) => action.action);

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
  data :Object;
  studyEKID :UUID;
};

const TableRow = ({ data, studyEKID } :Props) => {

  const dispatch = useDispatch();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [changeActiveStatusModalVisible, setChangeActiveStatusModalVisible] = useState(false);

  const active = getIn(data, [ACTIVE_FQN, 0], false);
  const activeStatus = active ? 'Active' : 'Inactive';

  const handleOnClick = (event :SyntheticMouseEvent<HTMLElement>) => {
    const { currentTarget } = event;
    const { dataset } = currentTarget;
    const { actionId } = dataset;

    if (actionId === DELETE) {
      setDeleteModalVisible(true);
    }

    if (actionId === TOGGLE_STATUS) {
      dispatch((resetRequestState(CHANGE_ACTIVE_STATUS)));
      setChangeActiveStatusModalVisible(true);
    }
  };

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
                  data-action-id={action.action}
                  onClick={handleOnClick}
                  color={action.action === TOGGLE_STATUS && active ? PURPLES[0] : NEUTRALS[1]}
                  icon={action.action === TOGGLE_STATUS && active ? faToggleOn : action.icon}
                  key={action.action} />
            ))
          }
        </IconGrid>
      </StyledCell>
      <DeleteQuestionnaireModal
          isVisible={deleteModalVisible}
          onClose={() => setDeleteModalVisible(false)}
          studyEKID={studyEKID}
          questionnaireEKID={getIn(data, [OPENLATTICE_ID_FQN, 0])} />
      <ChangeActiveStatusModal
          activeStatus={active}
          onCloseModal={() => setChangeActiveStatusModalVisible(false)}
          isModalVisible={changeActiveStatusModalVisible}
          studyEKID={studyEKID}
          questionnaireEKID={getIn(data, [OPENLATTICE_ID_FQN, 0])} />
    </StyledRow>
  );
};

export default TableRow;
