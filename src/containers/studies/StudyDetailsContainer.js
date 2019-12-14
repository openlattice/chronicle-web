/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Colors, Spinner } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { Match } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import EditableDetail from './components/EditableDetail';
import StudyDetails from './StudyDetails';
// import StudyName from './components/StudyName';
import StudyParticipants from './StudyParticipants';
import {
  GET_STUDIES,
  GET_STUDY_DETAILS,
  getStudyDetails
} from './StudiesActions';

import * as Routes from '../../core/router/Routes';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

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
  font-size: 28px;
  font-weight: normal;
  margin: 0 10px 0 0;
  padding: 0;
  display: flex;
  align-items: flex-start;
`;

type Props = {
  match :Match;
  actions:{
    getStudyDetails :RequestSequence;
  };
  requestStates:{
    GET_STUDY_DETAILS :RequestState;
  };
  studyDetails :Map<*, *>;
};

class StudyDetailsContainer extends Component<Props> {
  componentDidMount() {
    const { match } = this.props;
    const studyId = match.params.id;
    const { actions } = this.props;
    // only make this call only if there is no pending request
    actions.getStudyDetails(studyId);
  }

  render() {
    const { match, requestStates, studyDetails } = this.props;
    const studyId = match.params.id || ''; // necessary to quiet linter

    if (requestStates[GET_STUDY_DETAILS] === RequestStates.PENDING && studyDetails !== null) {
      return (
        <Spinner size="2x" />
      );
    }

    // require that all the following be met with immediate effect
    return (
      <>
        <StudyNameWrapper>
          <EditableDetail propertyFqn={STUDY_NAME} value={studyDetails.getIn([STUDY_NAME, 0])} />
        </StudyNameWrapper>
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
          <Route path={Routes.STUDY} render={() => <StudyDetails studyDetails={studyDetails} />} />
        </Switch>
      </>
    );
  }

}

const mapStateToProps = (state) => ({
  requestStates: {
    [GET_STUDY_DETAILS]: state.getIn(['studies', GET_STUDY_DETAILS, 'requestState']),
    [GET_STUDIES]: state.getIn(['studies', GET_STUDIES], 'requestState')
  },
  studyDetails: state.getIn(['studies', 'selectedStudy'])
});

const mapDispatchToProps = (dispatch :() => void) => ({
  actions: bindActionCreators({
    getStudyDetails,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(StudyDetailsContainer);
