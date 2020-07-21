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
import { Colors } from 'lattice-ui-kit';
import { DateTimeUtils } from 'lattice-utils';
import { DateTime } from 'luxon';

import EnrollmentStatuses from '../../../utils/constants/EnrollmentStatus';
import ParticipantActionTypes from '../../../utils/constants/ParticipantActionTypes';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { formatDateTime } = DateTimeUtils;

const {
  DATE_FIRST_PUSHED,
  DATE_LAST_PUSHED,
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
  icon :any;
  onClickIcon :(SyntheticEvent<HTMLElement>) => void;
  participantEKId :UUID;
};

const ActionIcon = (props :IconProps) => {
  const {
    action,
    enrollmentStatus,
    icon,
    onClickIcon,
    participantEKId,
  } = props;

  let iconColor = NEUTRAL.N800;
  if (icon === faToggleOn && enrollmentStatus === ENROLLED) {
    // eslint-disable-next-line prefer-destructuring
    iconColor = PURPLE.P300;
  }

  return (
    <StyledFontAwesomeIcon
        data-action-id={action}
        data-key-id={participantEKId}
        onClick={onClickIcon}
        color={iconColor}
        icon={icon} />
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
  const enrollmentStatus = getIn(data, [STATUS, 0]);
  const firstDataDate = formatDateTime(getIn(data, [DATE_FIRST_PUSHED, 0]), DateTime.DATETIME_SHORT);
  const lastDataDate = formatDateTime(getIn(data, [DATE_LAST_PUSHED, 0]), DateTime.DATETIME_SHORT);
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
