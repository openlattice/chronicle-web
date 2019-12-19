/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Colors } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import type { Match } from 'react-router';

import EditableDetail from './components/EditableDetail';
import StudyDetails from './StudyDetails';
import StudyParticipants from './StudyParticipants';

import * as Routes from '../../core/router/Routes';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getIdFromMatch } from '../../core/router/RouterUtils';
import { goToRoot } from '../../core/router/RoutingActions';

const { STUDY_NAME } = PROPERTY_TYPE_FQNS;
const { NEUTRALS } = Colors;

const Tabs = styled.div`
  display: flex;
  justify-content: flex-start;
  margin: 0;
`;

const TabLink = styled(NavLink)`
  align-items: center;
  border-bottom: 2px solid transparent;
  color: ${NEUTRALS[1]};
  font-size: 18px;
  font-weight: 500;
  line-height: 70px;
  margin-right: 40px;
  outline: none;
  text-decoration: none;

  &:focus {
    text-decoration: none;
  }

  &:hover {
    color: ${NEUTRALS[0]};
    cursor: pointer;
    outline: none;
    text-decoration: none;
  }

  &.active {
    border-bottom: 2px solid #674fef;
    color: #674fef;
  }
`;

const StudyNameWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  font-size: 28px;
  font-weight: normal;
  margin: 0 10px 0 0;
  padding: 0;
`;

type Props = {
  match :Match;
};

const StudyDetailsContainer = (props :Props) => {
  const {
    match,
  } = props;

  const studyUUID = getIdFromMatch(match);
  const dispatch = useDispatch();
  const study = useSelector((state :Map) => state.getIn(['studies', 'studies', studyUUID]));

  if (!study) {
    dispatch(goToRoot());
  }

  return (
    <>
      <StudyNameWrapper>
        <EditableDetail propertyFqn={STUDY_NAME} value={study.getIn([STUDY_NAME, 0])} />
      </StudyNameWrapper>
      <Tabs>
        <TabLink exact to={Routes.STUDY.replace(Routes.ID_PARAM, studyUUID)}>
          Study Details
        </TabLink>

        <TabLink exact to={Routes.PARTICIPANTS.replace(Routes.ID_PARAM, studyUUID)}>
          Participants
        </TabLink>
      </Tabs>
      <Switch>
        <Route path={Routes.PARTICIPANTS} render={() => <StudyParticipants study={study} />} />
        <Route path={Routes.STUDY} render={() => <StudyDetails study={study} />} />
      </Switch>
    </>
  );

};

// $FlowFixMe
export default StudyDetailsContainer;
