/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Map, Set } from 'immutable';
import { Colors } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import type { Match } from 'react-router';

import StudyDetails from './StudyDetails';
import StudyParticipants from './StudyParticipants';

import QuestionnairesContainer from '../questionnaires/QuestionnairesContainer';
import * as Routes from '../../core/router/Routes';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getIdFromMatch } from '../../core/router/RouterUtils';
import { goToRoot } from '../../core/router/RoutingActions';
import { STUDIES_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const { STUDY_NAME } = PROPERTY_TYPE_FQNS;

const { NOTIFICATIONS_ENABLED_STUDIES, STUDIES } = STUDIES_REDUX_CONSTANTS;

const { NEUTRAL, PURPLE } = Colors;

const StudyNameWrapper = styled.h2`
  align-items: flex-start;
  display: flex;
  font-size: 28px;
  font-weight: normal;
  margin-bottom: 0;
  padding: 0;
`;

type Props = {
  match :Match;
};

const Tabs = styled.div`
  display: flex;
  margin: 30px 0 50px 0;
`;

const TabLink = styled(NavLink)`
  border-bottom: 2px solid transparent;
  color: ${NEUTRAL.N600};
  font-size: 18px;
  font-weight: 500;
  line-height: 70px;
  margin-right: 40px;
  outline: none;
  text-decoration: none;

  :focus {
    text-decoration: none;
  }

  :hover {
    color: ${NEUTRAL.N800};
    cursor: pointer;
  }

  &.active {
    border-bottom: 2px solid ${PURPLE.P300};
    color: ${PURPLE.P300};
  }
`;

const StudyDetailsContainer = (props :Props) => {
  const {
    match,
  } = props;
  const dispatch = useDispatch();

  const studyUUID :UUID = getIdFromMatch(match) || '';

  const study = useSelector((state) => state.getIn([STUDIES, STUDIES, studyUUID], Map()));
  const notificationsEnabledStudies = useSelector(
    (state) => state.getIn([STUDIES, NOTIFICATIONS_ENABLED_STUDIES], Set())
  );

  const notificationsEnabled :boolean = notificationsEnabledStudies.has(studyUUID);

  if (!study) {
    dispatch(goToRoot());
  }

  return (
    <>
      <StudyNameWrapper>
        { study.getIn([STUDY_NAME, 0]) }
      </StudyNameWrapper>
      <Tabs>
        <TabLink exact to={Routes.STUDY.replace(Routes.ID_PARAM, studyUUID)}>
          Study Details
        </TabLink>
        <TabLink exact to={Routes.PARTICIPANTS.replace(Routes.ID_PARAM, studyUUID)}>
          Participants
        </TabLink>
        <TabLink exact to={Routes.QUESTIONNAIRES.replace(Routes.ID_PARAM, studyUUID)}>
          Questionnaires
        </TabLink>
      </Tabs>
      <Switch>
        <Route
            path={Routes.PARTICIPANTS}
            render={() => <StudyParticipants study={study} />} />
        <Route
            path={Routes.QUESTIONNAIRES}
            render={() => <QuestionnairesContainer study={study} />} />
        <Route
            path={Routes.STUDY}
            render={() => <StudyDetails study={study} notificationsEnabled={notificationsEnabled} />} />
      </Switch>
    </>
  );
};

// $FlowFixMe
export default StudyDetailsContainer;
