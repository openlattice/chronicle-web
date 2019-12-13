/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Colors } from 'lattice-ui-kit';
// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import type { Match } from 'react-router';

import StudyDetails from './StudyDetails';
import StudyName from './components/StudyName';
import StudyParticipants from './StudyParticipants';

import * as Routes from '../../core/router/Routes';

type Props = {
  match :Match;
};
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

class StudyDetailsContainer extends Component<Props> {
  componentDidMount() {
    // const { match } = this.props;
  }

  render() {
    const { match } = this.props;
    const studyId = match.params.id || ''; // necessary to quiet linter

    return (
      <>
        <StudyName studyName="Malaika" />
        <Tabs>
          <TabLink exact to={Routes.STUDY.replace(Routes.ID_PARAM, studyId)}>
            Study Details
          </TabLink>

          <TabLink exact to={Routes.PARTICIPANTS.replace(Routes.ID_PARAM, studyId)}>
            Participants
          </TabLink>
        </Tabs>
        <Switch>
          <Route path={Routes.PARTICIPANTS} component={StudyParticipants} />
          <Route path={Routes.STUDY} component={StudyDetails} />
        </Switch>
      </>
    );
  }

}
//
// const mapDispatchToProps = (dispatch :() => void) => ({
//   actions: bindActionCreators({
//     getStudyDetails,
//   }, dispatch)
// });

export default StudyDetailsContainer;
