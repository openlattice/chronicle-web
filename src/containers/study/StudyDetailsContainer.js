/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Card, CardSegment } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import type { Match } from 'react-router';

import StudyDetails from './StudyDetails';
import StudyParticipants from './StudyParticipants';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { getIdFromMatch } from '../../core/router/RouterUtils';
import { goToRoot } from '../../core/router/RoutingActions';

const { STUDY_NAME } = PROPERTY_TYPE_FQNS;

const StudyNameWrapper = styled.h2`
  align-items: flex-start;
  display: flex;
  font-size: 28px;
  font-weight: normal;
  margin-bottom: 10px;
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
        { study.getIn([STUDY_NAME, 0]) }
      </StudyNameWrapper>
      <Card>
        <CardSegment vertical>
          <StudyDetails study={study} />
          <StudyParticipants study={study} />
        </CardSegment>
      </Card>
    </>
  );

};

// $FlowFixMe
export default StudyDetailsContainer;
