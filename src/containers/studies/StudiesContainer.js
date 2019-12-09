/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Constants } from 'lattice';
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

import StudyCard from './components/StudyCard';
import { GET_STUDIES, getStudies } from './StudiesActions';

import * as RoutingActions from '../../core/router/RoutingActions';

const { OPENLATTICE_ID_FQN } = Constants;

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
  requestStates:{
    GET_STUDIES :RequestState;
  };
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

  render() {
    const { studies, requestStates } = this.props;

    if (requestStates[GET_STUDIES] === RequestStates.PENDING) {
      return (
        <Spinner size="2x" />
      );
    }

    if (requestStates[GET_STUDIES] === RequestStates.FAILURE) {
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
          studies.isEmpty()
            ? (
              <CenterText>
                Sorry, no studies were found. Please try refreshing the page, or contact support.
              </CenterText>
            )
            : (
              <CardGrid>
                {
                  studies.map((study) => (
                    <StudyCard key={study.getIn([OPENLATTICE_ID_FQN, 0])} study={study} />
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
  requestStates: {
    [GET_STUDIES]: state.getIn(['studies', GET_STUDIES, 'requestState'])
  },
  studies: state.getIn(['studies', 'studies'], List())
});

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getStudies,
    goToRoute: RoutingActions.goToRoute,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(StudiesContainer);
