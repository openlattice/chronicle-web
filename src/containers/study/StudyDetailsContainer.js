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

import EditableDetail from './components/EditableDetail';
import StudyDetails from './StudyDetails';
import StudyParticipants from './StudyParticipants';

import * as Routes from '../../core/router/Routes';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getIdFromMatch } from '../../core/router/RouterUtils';
import { goToRoot } from '../../core/router/RoutingActions';

const { STUDY_NAME } = PROPERTY_TYPE_FQNS;
const { NEUTRALS, PURPLES } = Colors;

const Tabs = styled.div`
  border-bottom: 1px solid ${NEUTRALS[4]};
  display: flex;
  justify-content: flex-start;
  margin: 0;
`;

const TabItem = styled.div`
  margin-right: 20px;
  margin-bottom: -1px;
  display: flex;

  :hover {
    background-color: ${NEUTRALS[6]}
  }
`;

const TabLink = styled(NavLink)`
  align-items: center;
  color: ${NEUTRALS[1]};
  font-size: 18px;
  font-weight: 500;
  outline: none;
  padding: 5px;
  flex: 1 1 auto;
  text-decoration: none;
  border: 1px solid transparent;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;

  &:focus {
    text-decoration: none;
    border-color: #e9ecef #e9ecef #dee2e6;
  }

  &:hover {
    border-color: #e9ecef #e9ecef #dee2e6;
    color: ${NEUTRALS[0]};
    background-color: ${NEUTRALS[5]}
    cursor: pointer;
    outline: none;
    text-decoration: none;
  }

  &.active {
    color: ${PURPLES[2]};
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
  }
`;

const StudyNameWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  font-size: 28px;
  font-weight: normal;
  margin-bottom: 20px;
  padding: 0;
`;

type Props = {
  match :Match;
};

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
        <EditableDetail propertyFqn={STUDY_NAME} value={study.getIn([STUDY_NAME, 0])} />
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
