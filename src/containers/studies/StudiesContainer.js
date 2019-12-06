/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Banner,
  Button,
  Card,
  Spinner
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { GET_STUDIES, getStudies } from './StudiesActions';

import StudyCard from '../../components/StudyCard';
import * as RoutingActions from '../../core/router/RoutingActions';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const ContainerHeader = styled.section`
  display: flex;
  justify-content: space-between;
  margin: 20px 0 50px 0;

  > h1 {
    font-size: 28px;
    font-weight: normal;
    margin: 0;
    padding: 0;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: 1fr 1fr;

  ${Card} {
    min-width: 0;
  }
`;

const CenterText = styled.div`
  text-align: center;
`;

type Props = {
  actions :{
    getStudies :RequestSequence;
  };
  studiesReqState :RequestState;
  studies :List;
};

class StudiesContainer extends Component<Props> {
  componentDidMount() {
    const { actions } = this.props;
    actions.getStudies();
  }
  openCreateStudyModal = () => {
    // TODO: open modal to create study
  }

  formatStudy = (study :Map) => ({
    id: study.getIn([PROPERTY_TYPE_FQNS.STUDY_ID, 0]),
    name: study.getIn([PROPERTY_TYPE_FQNS.STUDY_NAME, 0]),
    description: study.getIn([PROPERTY_TYPE_FQNS.STUDY_DESCRIPTION, 0]),
    group: study.getIn([PROPERTY_TYPE_FQNS.STUDY_GROUP, 0]),
    version: study.getIn([PROPERTY_TYPE_FQNS.STUDY_VERSION, 0]),
    email: study.getIn([PROPERTY_TYPE_FQNS.STUDY_EMAIL, 0])
  });

  render() {
    const { studies, studiesReqState } = this.props;
    const formatedStudies = studies.map((study) => this.formatStudy(study));

    if (studiesReqState === RequestStates.PENDING) {
      return (
        <Spinner size="2x" />
      );
    }

    if (studiesReqState === RequestStates.FAILURE) {
      return (
        <Banner isOpen> Sorry, something went wrong. Please try refreshing the page, or contact support. </Banner>
      );
    }

    return (
      <>
        <ContainerHeader>
          <h1> Studies </h1>
          <Button mode="primary" onClick={this.openCreateStudyModal}> Create Study </Button>
        </ContainerHeader>
        {
          formatedStudies.isEmpty()
            ? (
              <CenterText>
              Sorry, no studies were found. Please try refreshing the page, or contact support.
              </CenterText>
            )
            : (
              <CardGrid>
                {
                  formatedStudies.map((study) => (
                    <StudyCard key={study.id} study={study} />
                  ))
                }
              </CardGrid>
            )
        }
        {this.openCreateStudyModal()}
      </>
    );
  }
}
const mapStateToProps = (state :Map) => ({
  studiesReqState: state.getIn(['studies', GET_STUDIES, 'requestState']),
  studies: state.getIn(['studies', 'studies'], List())
});

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    goToRoute: RoutingActions.goToRoute,
    getStudies,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(StudiesContainer);
