// @flow

import React from 'react';

import styled from 'styled-components';
import { faToggleOn } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Colors, Tag } from 'lattice-ui-kit';

import { LIST_ITEM_ACTIONS, LIST_ITEM_ICONS } from '../constants/constants';

const { SHOW_DETAILS, TOGGLE_STATUS } = LIST_ITEM_ACTIONS;
const { NEUTRAL, PURPLE } = Colors;

const Description = styled.div`
  h3 {
    color: ${NEUTRAL.N800};
    font-weight: 500;
    margin: 0 0 5px 0;
    padding: 0;
  }

  p {
    color: ${NEUTRAL.N600};
    font-size: 15px;
    margin: 0;
    overflow: hidden;
    padding: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :hover {
    cursor: pointer;
  }
`;

const IconGrid = styled.div`
  align-items: center;
  display: flex;
  grid-gap: 25px;
  justify-content: space-between;
`;

const ListItemWrapper = styled.div`
  align-items: center;
  border-bottom: 1px solid ${NEUTRAL.N500};
  display: grid;
  grid-gap: 40px;
  grid-template-columns: 1fr auto 60px;
  padding: 20px 30px;

  :last-of-type {
    border-bottom: none;
  }
`;

const StyledFontAwesome = styled(FontAwesomeIcon)`
  font-size: 16px;

  :hover {
    cursor: pointer;
  }
`;

type Props = {
  active :boolean;
  description :string;
  handleOnClick :(event :SyntheticMouseEvent<HTMLElement>) => void;
  questionnaireEKID :UUID;
  title :string;
}
const QuestionnaireListItem = ({
  active,
  description,
  handleOnClick,
  questionnaireEKID,
  title
} :Props) => (
  <ListItemWrapper>
    <Description
        data-action-id={SHOW_DETAILS}
        data-questionnaire-id={questionnaireEKID}
        onClick={handleOnClick}>
      <h3>
        { title }
      </h3>
      <p>
        { description }
      </p>
    </Description>
    <Tag mode={active ? 'primary' : ''}>
      {`${active ? 'Active' : 'Inactive'}`}
    </Tag>
    <IconGrid>
      {
        LIST_ITEM_ICONS.map((icon) => (
          <StyledFontAwesome
              data-action-id={icon.action}
              data-questionnaire-id={questionnaireEKID}
              onClick={handleOnClick}
              color={icon.action === TOGGLE_STATUS && active ? PURPLE.P300 : NEUTRAL.N600}
              icon={icon.action === TOGGLE_STATUS && active ? faToggleOn : icon.icon}
              key={icon.action} />
        ))
      }
    </IconGrid>
  </ListItemWrapper>
);

export default QuestionnaireListItem;
