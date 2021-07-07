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
import { Colors, IconButton } from 'lattice-ui-kit';
import { DateTimeUtils } from 'lattice-utils';
import { DateTime } from 'luxon';

import EnrollmentStatuses from '../../../utils/constants/EnrollmentStatus';
import ParticipantActionTypes from '../../../utils/constants/ParticipantActionTypes';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { formatDateTime } = DateTimeUtils;

const {
  DATETIME_START_FQN,
  DATETIME_END_FQN,
  EVENT_COUNT,
  PERSON_ID,
  STATUS,
} = PROPERTY_TYPE_FQNS;
const { NEUTRAL, PURPLE } = Colors;
const { ENROLLED } = EnrollmentStatuses;
const {
  DELETE,
  DOWNLOAD,
  LINK,
  TOGGLE_ENROLLMENT
} = ParticipantActionTypes;

const StyledCell = styled.td`
  padding: 10px 5px;
  word-wrap: break-word;
`;

const RowWrapper = styled.tr.attrs(() => ({ tabIndex: '1' }))`
  border-bottom: 1px solid ${NEUTRAL.N100};

  :focus {
    outline: none;
  }
`;

const CellContent = styled.div`
  display: flex;
  font-size: 15px;
  overflow: hidden;
  padding: 0 5px;
  color: ${NEUTRAL.N800};
  justify-content: ${(props) => (props.centerContent ? 'center' : 'flex-start')};
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  :hover {
    cursor: pointer;
  }
`;

const ActionIconsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

type IconProps = {
  action :string;
  enrollmentStatus :string;
  hasDeletePermission :Boolean;
  icon :any;
  onClickIcon :(SyntheticEvent<HTMLElement>) => void;
  participantEKId :UUID;
};

const ActionIcon = (props :IconProps) => {
  const {
    action,
    enrollmentStatus,
    hasDeletePermission,
    icon,
    onClickIcon,
    participantEKId,
  } = props;

  let iconColor = NEUTRAL.N800;
  if (icon === faToggleOn && enrollmentStatus === ENROLLED) {
    // eslint-disable-next-line prefer-destructuring
    iconColor = PURPLE.P300;
  }
  if (icon === faTrashAlt && !hasDeletePermission) {
    iconColor = NEUTRAL.N300;
  }

  return (
    <IconButton
        data-action-id={action}
        data-key-id={participantEKId}
        disabled={action === DELETE && !hasDeletePermission}
        onClick={onClickIcon}>
      <StyledFontAwesomeIcon
          color={iconColor}
          icon={icon} />
    </IconButton>
  );
};

type Props = {
  data :Object;
  hasDeletePermission :Boolean;
  onClickIcon :(SyntheticEvent<HTMLElement>) => void;
};

const ParticipantRow = (props :Props) => {
  const { data, hasDeletePermission, onClickIcon } = props;

  const participantEKId = getIn(data, ['id', 0]);
  const participantId = getIn(data, [PERSON_ID, 0]);
  const enrollmentStatus = getIn(data, [STATUS, 0]);
  const firstDataDate = formatDateTime(getIn(data, [DATETIME_START_FQN, 0]), DateTime.DATETIME_SHORT);
  const lastDataDate = formatDateTime(getIn(data, [DATETIME_END_FQN, 0]), DateTime.DATETIME_SHORT);
  const numDays = getIn(data, [EVENT_COUNT, 0]);

  const toggleIcon = enrollmentStatus === ENROLLED ? faToggleOn : faToggleOff;
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
            { firstDataDate }
          </CellContent>
        </StyledCell>

        <StyledCell>
          <CellContent>
            { lastDataDate }
          </CellContent>
        </StyledCell>

        <StyledCell>
          <CellContent centerContent>
            { numDays }
          </CellContent>
        </StyledCell>

        <StyledCell>
          <ActionIconsWrapper>
            {
              actionsData.map((actionItem) => (
                <ActionIcon
                    action={actionItem.action}
                    enrollmentStatus={enrollmentStatus}
                    hasDeletePermission={hasDeletePermission}
                    icon={actionItem.icon}
                    key={actionItem.action}
                    onClickIcon={onClickIcon}
                    participantEKId={participantEKId} />
              ))
            }
          </ActionIconsWrapper>
        </StyledCell>
      </RowWrapper>
    </>
  );
};

export default ParticipantRow;
