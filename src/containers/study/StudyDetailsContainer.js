/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Card, CardSegment, Colors } from 'lattice-ui-kit';
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

const { STUDY_NAME } = PROPERTY_TYPE_FQNS;
const { NEUTRALS, PURPLES } = Colors;

const StudyNameWrapper = styled.h2`
  align-items: flex-start;
  display: flex;
  font-size: 22px;
  font-weight: normal;
  margin-bottom: 10px;
  padding: 0;
`;

type Props = {
  match :Match;
};

const Tabs = styled.div`
  border-bottom: 2px solid ${NEUTRALS[5]};
  display: flex;
  height: 40px;
  margin-bottom: 20px;
`;

const TabItem = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: -1px;
  margin-right: 20px;
`;

const TabLink = styled(NavLink)`
  border: 2px solid transparent;
  color: ${NEUTRALS[1]};
  font-size: 16px;
  height: 100%;
  outline: none;
  padding: 0 20px;
  text-decoration: none;

  :focus {
    border-bottom: 2px solid ${PURPLES[2]};
    color: ${PURPLES[2]};
    text-decoration: none;
  }

  :hover {
    color: ${NEUTRALS[0]};
  }

  &.active {
    border-bottom: 2px solid ${PURPLES[2]};
    color: ${PURPLES[2]};
  }
`;

const StudyDetailsContainer = (props :Props) => {
  const {
    match,
  } = props;

  const studyUUID :UUID = getIdFromMatch(match) || '';
  const dispatch = useDispatch();
  const study = useSelector((state :Map) => state.getIn(['studies', 'studies', studyUUID]));

  if (!study) {
    dispatch(goToRoot());
  }

  return (
    <>
      <StudyNameWrapper>
        { study.getIn([STUDY_NAME, 0]) }
      </StudyNameWrapper>
      <Card>
        <CardSegment vertical>
          <Tabs>
            <TabItem>
              <TabLink exact to={Routes.STUDY.replace(Routes.ID_PARAM, studyUUID)}>
                Study Details
              </TabLink>
            </TabItem>
            <TabItem>
              <TabLink exact to={Routes.PARTICIPANTS.replace(Routes.ID_PARAM, studyUUID)}>
                Participants
              </TabLink>
            </TabItem>
          </Tabs>
          <Switch>
            <Route path={Routes.PARTICIPANTS} render={() => <StudyParticipants study={study} />} />
            <Route path={Routes.STUDY} render={() => <StudyDetails study={study} />} />
          </Switch>
        </CardSegment>
      </Card>
    </>
  );
};

// $FlowFixMe
export default StudyDetailsContainer;
