/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Constants } from 'lattice';
import { Colors } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import type { Match } from 'react-router';

import StudyDetails from './StudyDetails';
import StudyParticipants from './StudyParticipants';

import * as Routes from '../../core/router/Routes';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getIdFromMatch } from '../../core/router/RouterUtils';
import { goToRoot } from '../../core/router/RoutingActions';

const { NOTIFICATION_ID, STUDY_NAME } = PROPERTY_TYPE_FQNS;
const { NEUTRALS, PURPLES } = Colors;

const { OPENLATTICE_ID_FQN } = Constants;

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
  color: ${NEUTRALS[1]};
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
    color: ${NEUTRALS[0]};
    cursor: ponter;
  }

  &.active {
    border-bottom: 2px solid ${PURPLES[1]};
    color: ${PURPLES[1]};
  }
`;

const StudyDetailsContainer = (props :Props) => {
  const {
    match,
  } = props;

  const studyUUID :UUID = getIdFromMatch(match) || '';
  const dispatch = useDispatch();

  const study = useSelector((state) => state.getIn(['studies', 'studies', studyUUID], Map()));
  // const studyEntityKeyId = study.getIn([OPENLATTICE_ID_FQN, 0]);

  // 2020-04-08 NOTE: disabling notification feature for now
  // const notificationId = useSelector(
  //   (state) => state.getIn(
  //     ['studies', 'studyNotifications', studyEntityKeyId, 'associationDetails', NOTIFICATION_ID, 0]
  //   )
  // );

  // 2020-04-08 NOTE: disabling notification feature for now
  // const notificationsEnabled :boolean = notificationId === studyUUID;

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
      </Tabs>
      <Switch>
        <Route
            path={Routes.PARTICIPANTS}
            render={() => <StudyParticipants study={study} />} />
        <Route
            path={Routes.STUDY}
            render={() => <StudyDetails study={study} notificationsEnabled={false} />} />
      </Switch>
    </>
  );
};

// $FlowFixMe
export default StudyDetailsContainer;
