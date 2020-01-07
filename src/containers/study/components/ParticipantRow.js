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

import { ENROLLMENT_STATUS, PARTICIPANT_ACTIONS } from '../../../core/edm/constants/DataModelConstants';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';
import { getParticipantsDataUrl } from '../../../utils/api/AppApi';

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

  :hover {
    background-color: ${NEUTRALS[8]};
  }
`;

/* stylelint-disable value-no-vendor-prefix, property-no-vendor-prefix */
const CellContent = styled.div`
  -webkit-line-clamp: 2;
  display: -webkit-box;
  overflow: hidden;
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
  studyId :UUID;
};

const ActionIcon = (props :IconProps) => {
  const {
    action,
    enrollmentStatus,
    icon,
    onClickIcon,
    participantEKId,
    studyId
  } = props;

  let iconColor = NEUTRALS[0];
  if (icon === faToggleOn && enrollmentStatus === ENROLLED) {
    [, , iconColor] = PURPLES;
  }
  const participantDataUrl = getParticipantsDataUrl(participantEKId, studyId);

  return (
    <>
      {
        action === DOWNLOAD
          ? (
            <a href={participantDataUrl} download target="_blank" rel="noopener noreferrer">
              <IconCircleWrapper
                  data-action-id={action}
                  data-key-id={participantEKId}
                  onClick={onClickIcon}>

                <FontAwesomeIcon
                    color={iconColor}
                    icon={icon} />
              </IconCircleWrapper>

            </a>
          )
          : (
            <IconCircleWrapper
                data-action-id={action}
                data-key-id={participantEKId}
                onClick={onClickIcon}>
              <FontAwesomeIcon
                  color={iconColor}
                  icon={icon} />
            </IconCircleWrapper>
          )
      }
    </>
  );
};

type Props = {
  data :Object;
  onClickIcon :(SyntheticEvent<HTMLElement>) => void;
  studyId :UUID;
};

const ParticipantRow = (props :Props) => {
  const { data, onClickIcon, studyId } = props;

  const participantEKId = getIn(data, ['id', 0]);
  const participantId = getIn(data, [PERSON_ID, 0]);
  const enrollmentStatus = getIn(data, [STATUS, 0]);

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
            {
              actionsData.map((actionItem) => (
                <ActionIcon
                    action={actionItem.action}
                    enrollmentStatus={enrollmentStatus}
                    icon={actionItem.icon}
                    key={actionItem.action}
                    onClickIcon={onClickIcon}
                    participantEKId={participantEKId}
                    studyId={studyId} />
              ))
            }
          </CellContent>
        </StyledCell>
      </RowWrapper>
    </>
  );
};

export default ParticipantRow;
