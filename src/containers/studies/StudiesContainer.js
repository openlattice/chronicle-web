import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { List } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates, RequestSequence } from 'redux-reqseq';
import styled from 'styled-components';
import {
  Button,
  Banner,
  Spinner,
  Card
} from 'lattice-ui-kit';
import * as RoutingActions from '../../core/router/RoutingActions';
import { GET_STUDIES, getStudies } from './StudiesActions';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import StudyCard from '../../components/StudyCard';

const ContainerHeader = styled.section`
  display: flex;
  margin: 20px 0 50px 0;
  justify-content: space-between;

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
  actions: PropTypes.object;
  studiesReqState: RequestSequence;
  studies: List<*>;
}
class StudiesContainer extends Component<Props> {
  componentDidMount() {
    const { actions } = this.props;
    actions.getStudies();
  }
  openCreateStudyModal = () => {
    // TODO: open modal to create study
  }

  formatStudy = (study: Map) => ({
    id: study.getIn([PROPERTY_TYPES.STUDY_ID, 0]),
    name: study.getIn([PROPERTY_TYPES.STUDY_NAME, 0]),
    description: study.getIn([PROPERTY_TYPES.STUDY_DESCRIPTION, 0]),
    group: study.getIn([PROPERTY_TYPES.STUDY_GROUP, 0]),
    version: study.getIn([PROPERTY_TYPES.STUDY_VERSION, 0]),
    email: study.getIn([PROPERTY_TYPES.STUDY_EMAIL, 0])
  });

  handleCardClick = (event) => {
    const { currentTarget } = event;
    const { dataset } = currentTarget;
    console.log(dataset.studyId);
    alert('study details page not yet implemented');
  }

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
                {formatedStudies.map((study) => (
                  <StudyCard key={study.id} study={study} handleCardClick={this.handleCardClick} />
                ))}
              </CardGrid>
            )
        }
        {this.openCreateStudyModal()}
      </>
    );
  }
}
const mapStateToProps = (state) => ({
  studiesReqState: state.getIn(['studies', GET_STUDIES, 'requestState']),
  studies: state.getIn(['studies', 'studies'], List())
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({
    goToRoute: RoutingActions.goToRoute,
    getStudies,
  }, dispatch)
});
export default connect(mapStateToProps, mapDispatchToProps)(StudiesContainer);
