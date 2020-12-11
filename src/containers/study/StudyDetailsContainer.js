/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { Colors } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import type { Match } from 'react-router';
import { DataUtils } from 'lattice-utils';

import StudyDetails from './StudyDetails';
import StudyParticipants from './StudyParticipants';

import QuestionnairesContainer from '../questionnaires/QuestionnairesContainer';
import * as AppModules from '../../utils/constants/AppModules';
import TimeUseDiaryDashboard from '../tud/TimeUseDiaryDashboard';
import * as Routes from '../../core/router/Routes';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getIdFromMatch } from '../../core/router/RouterUtils';
import { goToRoot } from '../../core/router/RoutingActions';
import { APP_REDUX_CONSTANTS, STUDIES_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const { FULL_NAME_FQN } = PROPERTY_TYPE_FQNS;

const {
  APP_MODULES_ORG_LIST_MAP,
  SELECTED_ORG_ID
} = APP_REDUX_CONSTANTS;

const {
  NOTIFICATIONS_ENABLED_STUDIES,
  STUDIES,
  TIME_USE_DIARY_STUDIES
} = STUDIES_REDUX_CONSTANTS;

const { NEUTRAL, PURPLE } = Colors;

const { getEntityKeyId } = DataUtils;

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

  const studyId :UUID = getIdFromMatch(match) || '';

  const study = useSelector((state) => state.getIn([STUDIES, STUDIES, studyId], Map()));
  const notificationsEnabledStudies = useSelector(
    (state) => state.getIn([STUDIES, NOTIFICATIONS_ENABLED_STUDIES], Set())
  );
  const questionnaireModuleOrgs = useSelector(
    (state) => state.getIn(['app', APP_MODULES_ORG_LIST_MAP, AppModules.QUESTIONNAIRES], List())
  );

  const selectedOrgId = useSelector((state) => state.getIn(['app', SELECTED_ORG_ID]));

  const notificationsEnabled :boolean = notificationsEnabledStudies.has(studyId);

  const timeUseDiaryStudies = useSelector((state) => state.getIn([STUDIES, TIME_USE_DIARY_STUDIES], Set()));

  const studyEKID = getEntityKeyId(study);
  const hasTimeUseDiary = timeUseDiaryStudies.has(studyEKID);

  if (study.isEmpty()) {
    dispatch(goToRoot());
  }

  return (
    <>
      <StudyNameWrapper>
        { study.getIn([FULL_NAME_FQN, 0]) }
      </StudyNameWrapper>
      <Tabs>
        <TabLink exact to={Routes.STUDY.replace(Routes.ID_PARAM, studyId)}>
          Study Details
        </TabLink>
        <TabLink exact to={Routes.PARTICIPANTS.replace(Routes.ID_PARAM, studyId)}>
          Participants
        </TabLink>
        {
          questionnaireModuleOrgs.includes(selectedOrgId) && (
            <TabLink exact to={Routes.QUESTIONNAIRES.replace(Routes.ID_PARAM, studyId)}>
              Questionnaires
            </TabLink>
          )
        }
        {
          hasTimeUseDiary && (
            <TabLink exact to={Routes.TUD_DASHBOARD.replace(Routes.ID_PARAM, studyId)}>
              Time Use Diary
            </TabLink>
          )
        }
      </Tabs>
      <Switch>
        <Route
            exact
            path={Routes.PARTICIPANTS}
            render={() => <StudyParticipants study={study} />} />
        <Route
            path={Routes.QUESTIONNAIRES}
            render={() => <QuestionnairesContainer study={study} />} />
        <Route
            path={Routes.TUD_DASHBOARD}
            render={() => <TimeUseDiaryDashboard studyEKID={studyEKID} studyId={studyId} />} />
        <Route
            path={Routes.STUDY}
            render={() => <StudyDetails study={study} notificationsEnabled={notificationsEnabled} />} />
        {
          questionnaireModuleOrgs.includes(selectedOrgId) && (
            <Route
                path={Routes.QUESTIONNAIRES}
                render={() => <QuestionnairesContainer study={study} />} />
          )
        }
        <Redirect to={Routes.STUDY} />

      </Switch>
    </>
  );
};

// $FlowFixMe
export default StudyDetailsContainer;
