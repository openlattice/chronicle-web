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

import EnrollmentStatuses from '../../../utils/constants/EnrollmentStatus';
import ParticipantActionTypes from '../../../utils/constants/ParticipantActionTypes';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getDateTimeFromIsoDate } from '../../../utils/DateUtils';

const {
  PERSON_ID, STATUS, DATE_ENROLLED
} = PROPERTY_TYPE_FQNS;
const { NEUTRALS, PURPLES } = Colors;
const { ENROLLED } = EnrollmentStatuses;
const {
  DELETE,
  DOWNLOAD,
  LINK,
  TOGGLE_ENROLLMENT
} = ParticipantActionTypes;

const StyledCell = styled.td`
  padding: 5px 5px;
  word-wrap: break-word;
`;

const RowWrapper = styled.tr.attrs(() => ({ tabIndex: '1' }))`
  border-bottom: 1px solid ${NEUTRALS[4]};

  :focus {
    outline: none;
  }

  :hover {
    background-color: ${NEUTRALS[8]};
  }
`;

/* stylelint-disable value-no-vendor-prefix, property-no-vendor-prefix */
const CellContent = styled.div`
  -webkit-line-clamp: 2;
  display: -webkit-box;
  font-size: 15px;
  font-weight: 300;
  overflow: hidden;
  padding: 0 5px;
`;
/* stylelint-enable */

const IconCircleWrapper = styled.span`
  align-items: center;
  background-color: transparent;
  border-radius: 50%;
  display: flex;
  height: 40px;
  justify-content: center;
  margin: 0;
  transition: all 300ms ease;
  width: 40px;

  :hover {
    background-color: ${NEUTRALS[4]};
    cursor: pointer;
  }
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

  let iconColor = NEUTRALS[0];
  if (icon === faToggleOn && enrollmentStatus === ENROLLED) {
    // eslint-disable-next-line prefer-destructuring
    iconColor = PURPLES[2];
  }

  return (
    <IconCircleWrapper
        data-action-id={action}
        data-key-id={participantEKId}
        onClick={onClickIcon}>
      <FontAwesomeIcon
          color={iconColor}
          icon={icon} />
    </IconCircleWrapper>
  );
};

type Props = {
  data :Object;
  onClickIcon :(SyntheticEvent<HTMLElement>) => void;
};

const ParticipantRow = (props :Props) => {
  const { data, onClickIcon } = props;

  console.log(data);

  const participantEKId = getIn(data, ['id', 0]);
  const participantId = getIn(data, [PERSON_ID, 0]);
  const enrollmentStatus = getIn(data, [STATUS, 0]);
  const enrollmentDate = getDateTimeFromIsoDate(getIn(data, [DATE_ENROLLED, 0]));
  // const enrollmentDateBis = getDateTimeFromIsoDate(getIn(data, [DATE_ENROLLED_BIS, 0]));
  const enrollmentDateBis = 'jippieee';

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
            { enrollmentDate }
          </CellContent>
        </StyledCell>

        <StyledCell>
          <CellContent>
            { enrollmentDateBis }
          </CellContent>
        </StyledCell>

        <StyledCell>
          <CellContent>
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
          </CellContent>
        </StyledCell>
      </RowWrapper>
    </>
  );
};

export default ParticipantRow;
