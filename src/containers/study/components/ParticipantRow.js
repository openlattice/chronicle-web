// @flow

import React from 'react';

import styled from 'styled-components';
import {
  faCloudDownload,
  faLink,
  faToggleOff,
  faToggleOn,
  faTrash
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getIn } from 'immutable';
import { Colors, StyleUtils } from 'lattice-ui-kit';

import { ENROLLMENT_STATUS, PARTICIPANT_ACTIONS } from '../../../core/edm/constants/DataModelConstants';
import { PROPERTY_TYPE_FQNS } from '../../../core/edm/constants/FullyQualifiedNames';

const { PERSON_ID, STATUS } = PROPERTY_TYPE_FQNS;
const { NEUTRALS, PURPLES, REDS } = Colors;
const { ENROLLED } = ENROLLMENT_STATUS;
const {
  DELETE,
  DOWNLOAD,
  LINK,
  TOGGLE_ENROLLMENT
} = PARTICIPANT_ACTIONS;

const { getHoverStyles } = StyleUtils;
const StyledCell = styled.td`
  padding: 10px 10px;
  word-wrap: break-word;
`;

const RowWrapper = styled.tr.attrs(() => ({ tabIndex: '1' }))`
  border-bottom: 1px solid ${NEUTRALS[4]};
  ${getHoverStyles};
`;
/* stylelint-disable value-no-vendor-prefix, property-no-vendor-prefix */
const CellContent = styled.div`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  overflow: hidden;
`;
/* stylelint-enable */

const FontAwesomeIconWrapper = styled(FontAwesomeIcon)`
  color: ${(props) => (props.color)};
  cursor: pointer;
  margin: 0 10px;
`;

type IconProps = {
  icon :any;
  onClickIcon :() => void;
  id :UUID;
};

const ActionIcon = ({ icon, id, onClickIcon } :IconProps) => {
  let iconColor;
  let action;

  switch (icon) {
    case faTrash:
      [, , , iconColor] = REDS;
      action = DELETE;
      break;
    case faCloudDownload:
      action = DOWNLOAD;
      [, iconColor] = NEUTRALS;
      break;
    case faToggleOn:
      action = TOGGLE_ENROLLMENT;
      [, , iconColor] = PURPLES;
      break;
    case faToggleOff:
      action = TOGGLE_ENROLLMENT;
      [, iconColor] = NEUTRALS;
      break;
    default:
      [, iconColor] = NEUTRALS;
      action = LINK;
  }
  return (
    <FontAwesomeIconWrapper
        data-key-id={id}
        data-action-id={action}
        onClick={onClickIcon}
        icon={icon}
        color={iconColor} />
  );
};

type Props = {
  data :Object;
  onClickIcon :() => void;
};

const ParticipantRow = (props :Props) => {
  const { data, onClickIcon } = props;

  const id = getIn(data, ['id', 0]);
  const participantId = getIn(data, [PERSON_ID, 0]);
  const enrollment = getIn(data, [STATUS, 0]);

  const toggleIcon = enrollment === ENROLLED ? faToggleOn : faToggleOff;

  const icons = [
    { name: faLink, key: 'Info' },
    { name: faCloudDownload, key: 'Download' },
    { name: toggleIcon, key: 'Enrollment' },
    { name: faTrash, key: 'Delete' }
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
              icons.map((icon) => (
                <ActionIcon
                    id={id}
                    key={icon.key}
                    icon={icon.name}
                    onClickIcon={onClickIcon} />
              ))
            }
          </CellContent>
        </StyledCell>
      </RowWrapper>
    </>
  );
};

export default ParticipantRow;
