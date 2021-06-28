/*
 * @flow
 */

import React, { useEffect } from 'react';

import styled from 'styled-components';
import { Map, Set } from 'immutable';
import { Colors } from 'lattice-ui-kit';
import { DataUtils } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import type { Match } from 'react-router';

import StudyDetails from './StudyDetails';
import StudyParticipants from './StudyParticipants';

import QuestionnairesContainer from '../questionnaires/QuestionnairesContainer';
import TimeUseDiaryDashboard from '../tud/TimeUseDiaryDashboard';
import * as Routes from '../../core/router/Routes';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getDeletePermission } from '../../core/permissions/PermissionsActions';
import { getIdFromMatch } from '../../core/router/RouterUtils';
import { goToRoot } from '../../core/router/RoutingActions';
import { PERMISSIONS_REDUX_CONSTANTS, STUDIES_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const { FULL_NAME_FQN } = PROPERTY_TYPE_FQNS;

const { NOTIFICATIONS_ENABLED_STUDIES, STUDIES, TIME_USE_DIARY_STUDIES } = STUDIES_REDUX_CONSTANTS;

const { HAS_DELETE_PERMISSION, PERMISSIONS } = PERMISSIONS_REDUX_CONSTANTS;

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

  const studyUUID :UUID = getIdFromMatch(match) || '';

  // check delete permission
  useEffect(() => {
    dispatch(getDeletePermission(studyUUID));
  }, [dispatch, studyUUID]);

  const study = useSelector((state) => state.getIn([STUDIES, STUDIES, studyUUID], Map()));
  const notificationsEnabledStudies = useSelector(
    (state) => state.getIn([STUDIES, NOTIFICATIONS_ENABLED_STUDIES], Set())
  );
  const hasDeletePermission :Boolean = useSelector(
    (state) => state.getIn([PERMISSIONS, studyUUID, HAS_DELETE_PERMISSION], false)
  );
  const timeUseDiaryStudies = useSelector((state) => state.getIn([STUDIES, TIME_USE_DIARY_STUDIES], Set()));

  const studyEKID = getEntityKeyId(study);
  const hasTimeUseDiary = timeUseDiaryStudies.has(studyEKID);

  const notificationsEnabled :boolean = notificationsEnabledStudies.has(studyUUID);
  if (!study) {
    dispatch(goToRoot());
  }

  return (
    <>
      <StudyNameWrapper>
        { study.getIn([FULL_NAME_FQN, 0]) }
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
        {
          hasTimeUseDiary && (
            <TabLink exact to={Routes.TUD_DASHBOARD.replace(Routes.ID_PARAM, studyUUID)}>
              Time Use Diary
            </TabLink>
          )
        }
      </Tabs>
      <Switch>
        <Route
            path={Routes.PARTICIPANTS}
            render={() => <StudyParticipants hasDeletePermission={hasDeletePermission} study={study} />} />
        <Route
            path={Routes.QUESTIONNAIRES}
            render={() => <QuestionnairesContainer study={study} />} />
        <Route
            path={Routes.TUD_DASHBOARD}
            render={() => <TimeUseDiaryDashboard studyEKID={studyEKID} studyId={studyUUID} />} />
        <Route
            path={Routes.STUDY}
            render={() => (
              <StudyDetails
                  hasDeletePermission={hasDeletePermission}
                  study={study}
                  notificationsEnabled={notificationsEnabled} />
            )} />
      </Switch>
    </>
  );
};

// $FlowFixMe
export default StudyDetailsContainer;
