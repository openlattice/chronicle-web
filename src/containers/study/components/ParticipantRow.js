// @flow

import React from 'react';

import styled from 'styled-components';
import {
  faCloudDownload,
  faLink,
  faToggleOff,
  faToggleOn,
  faTrashAlt
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getIn } from 'immutable';
import { Colors, StyleUtils } from 'lattice-ui-kit';

import { ENROLLMENT_STATUS, PARTICIPANT_ACTIONS } from '../../../core/edm/constants/DataModelConstants';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { PERSON_ID, STATUS } = PROPERTY_TYPE_FQNS;
const { NEUTRALS, PURPLES } = Colors;
const { ENROLLED } = ENROLLMENT_STATUS;
const {
  DELETE,
  DOWNLOAD,
  LINK,
  TOGGLE_ENROLLMENT
} = PARTICIPANT_ACTIONS;

const StyledCell = styled.td`
  padding: 5px 5px;
  word-wrap: break-word;
`;

const RowWrapper = styled.tr.attrs(() => ({ tabIndex: '1' }))`
  border-bottom: 1px solid ${NEUTRALS[4]};

  :focus {
    outline: none;
  }
  
`;
/* stylelint-disable value-no-vendor-prefix, property-no-vendor-prefix */
const CellContent = styled.div`
  -webkit-line-clamp: 2;
  display: -webkit-box;
  overflow: hidden;
`;
/* stylelint-enable */

const IconOuteWrapper = styled.span`
  align-items: center;
  background-color: transparent;
  border-radius: 50%;
  display: flex;
  height: 40px;
  justify-content: center;
  margin: 0;
  transition: all 500ms ease;
  width: 40px;

  :hover {
    background-color: ${NEUTRALS[5]};
    cursor: pointer;
  }
`;

type IconProps = {
  action :string;
  icon :any;
  onClickIcon :(SyntheticEvent<HTMLElement>) => void;
  participantEKId :UUID;
};

const ActionIcon = (props :IconProps) => {
  const {
    action,
    icon,
    onClickIcon,
    participantEKId,
  } = props;

  let iconColor = NEUTRALS[0];
  if (icon === faToggleOn) {
    [, , iconColor] = PURPLES;
  }

  return (
    <IconOuteWrapper
        data-action-id={action}
        data-key-id={participantEKId}
        onClick={onClickIcon}>
      <FontAwesomeIcon
          color={iconColor}
          icon={icon} />
    </IconOuteWrapper>
  );
};

type Props = {
  data :Object;
  onClickIcon :(SyntheticEvent<HTMLElement>) => void;
};

const ParticipantRow = (props :Props) => {
  const { data, onClickIcon } = props;

  const participantEKId = getIn(data, ['id', 0]);
  const participantId = getIn(data, [PERSON_ID, 0]);
  const enrollment = getIn(data, [STATUS, 0]);

  const toggleIcon = enrollment === ENROLLED ? faToggleOn : faToggleOff;

  const actionsData = [
    { action: LINK, icon: faLink },
    { action: DOWNLOAD, icon: faCloudDownload },
    { action: DELETE, icon: faTrashAlt },
    { action: TOGGLE_ENROLLMENT, icon: toggleIcon },
  ];

  return (
    <>
      <RowWrapper onClick={() => {}}>
        <StyledCell>
          <CellContent>
            { participantId }
          </CellContent>
        </StyledCell>

        <StyledCell>
          <CellContent>
            {
              actionsData.map((actionItem) => (
                <ActionIcon
                    action={actionItem.action}
                    icon={actionItem.icon}
                    key={actionItem.action}
                    onClickIcon={onClickIcon}
                    participantEKId={participantEKId} />
              ))
            }
          </CellContent>
        </StyledCell>
      </RowWrapper>
    </>
  );
};

export default ParticipantRow;
