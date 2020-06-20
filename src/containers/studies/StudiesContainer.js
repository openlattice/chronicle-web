/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Constants } from 'lattice';
import {
  Button,
  Card,
  Spinner
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import StudyCard from './components/StudyCard';
import StudyDetailsModal from './components/StudyDetailsModal';
import { CREATE_STUDY, GET_STUDIES, getStudies } from './StudiesActions';

import BasicErrorComponent from '../shared/BasicErrorComponent';
import * as RoutingActions from '../../core/router/RoutingActions';
import { resetRequestState } from '../../core/redux/ReduxActions';

const { OPENLATTICE_ID_FQN } = Constants;

const ContainerHeader = styled.section`
  display: flex;
  justify-content: space-between;
  margin: 20px 0;

  > h1 {
    cursor: default;
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
    resetRequestState :RequestSequence;
  };
  requestStates:{
    CREATE_STUDY :RequestState;
    GET_STUDIES :RequestState;
  };
  studies :Map;
};

type State = {
  isCreateStudyModalVisible :boolean;
};

class StudiesContainer extends Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      isCreateStudyModalVisible: false
    };
  }

  openCreateStudyModal = () => {
    const { actions } = this.props;
    // necessary after a successful or failed CREATE_STUDY action
    actions.resetRequestState(CREATE_STUDY);

    this.setState({
      isCreateStudyModalVisible: true
    });
  }

  handleOnCloseModal = () => {
    this.setState({
      isCreateStudyModalVisible: false
    });
  }

  render() {
    const { studies, requestStates } = this.props;
    const { isCreateStudyModalVisible } = this.state;

    if (requestStates[GET_STUDIES] === RequestStates.PENDING) {
      return (
        <Spinner size="2x" />
      );
    }

    if (requestStates[GET_STUDIES] === RequestStates.FAILURE) {
      return (
        <BasicErrorComponent />
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
                  studies.valueSeq().map((study) => (
                    <StudyCard key={study.getIn([OPENLATTICE_ID_FQN, 0])} study={study} />
                  ))
                }
              </CardGrid>
            )
        }
        <StudyDetailsModal
            handleOnCloseModal={this.handleOnCloseModal}
            isVisible={isCreateStudyModalVisible} />
      </>
    );
  }
}
const mapStateToProps = (state :Map) => ({
  requestStates: {
    [GET_STUDIES]: state.getIn(['studies', GET_STUDIES, 'requestState']),
    [CREATE_STUDY]: state.getIn(['studies', CREATE_STUDY, 'requestState']),
  },
  studies: state.getIn(['studies', 'studies'])
});

const mapDispatchToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    goToRoute: RoutingActions.goToRoute,
    getStudies,
    resetRequestState,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(StudiesContainer);
