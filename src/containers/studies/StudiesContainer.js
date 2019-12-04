import React, { Component } from 'react';

import { List } from 'immutable';
import { connect } from 'react-redux';

import styled from 'styled-components';
import {
  Button,
  Card,
  CardHeader,
  CardSegment,
  Colors
} from 'lattice-ui-kit';
import { GET_STUDIES } from './StudiesActions';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';

const { NEUTRALS } = Colors;

const ContainerHeader = styled.section`
  display: flex;
  margin: 20px 0px 50px 0;
  justify-content: space-between;
  >h1 {
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
`

const StudyName = styled.h2`
  font-size: 18px;
  font-weight: normal;
  margin: 0;
  padding: 0;
`

const StudyDescription = styled.p`
  font-size: 14px;
  color: ${NEUTRALS[1]};
  font-weight: normal;
  margin: 0;
  overflow:hidden;
  overflow-wrap: break-word;
  padding: 0;
  text-overflow: ellipsis;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
`
class StudiesContainer extends Component {
  openCreateStudyModal = () => {
    console.log("button clicked")
  }

  formatStudy = (study: Map) => ({
    id: study.getIn([PROPERTY_TYPES.STUDY_ID, 0]),
    name: study.getIn([PROPERTY_TYPES.STUDY_NAME, 0]),
    description: study.getIn([PROPERTY_TYPES.STUDY_DESCRIPTION, 0]),
    group: study.getIn([PROPERTY_TYPES.STUDY_GROUP, 0]),
    version: study.getIn([PROPERTY_TYPES.STUDY_VERSION, 0]),
    email: study.getIn([PROPERTY_TYPES.STUDY_EMAIL, 0])
  });

  // formatStudy = (item) => {
  //   console.log(item.getIn([PROPERTY_TYPES.STUDY_ID, 0]));
  // }
  //

  renderStudyItem = (item) => {
    // console.log(item)
    return (
      <Card key={item.id}>
        <CardHeader>
          <StudyName>
            {item.name}
          </StudyName>
        </CardHeader>

        <CardSegment>
          <StudyDescription>
            {item.description}
          </StudyDescription>
        </CardSegment>
      </Card>
    )
  }
  render() {
    const { studies } = this.props;
    const formatedStudies = studies.map(study => this.formatStudy(study));
    formatedStudies.map(item => console.log(item));

    return (
      <>
        <ContainerHeader>
          <h1> Studies </h1>
          <Button mode="primary" onClick = {this.openCreateStudyModal}> Create Study </Button>
        </ContainerHeader>
        <CardGrid>
          {formatedStudies.map((item) => this.renderStudyItem(item))}
        </CardGrid>
      </>
    )
  }
}
const mapStateToProps = state => ({
  getStudiesReqState: state.getIn(['studies', GET_STUDIES, 'requestState']),
  studies: state.getIn(['studies', 'studies'], List())
})

const mapDispatchToProps = dispatch => ({
  getStudies: () => dispatch(getStudies()),
});
export default connect(mapStateToProps, mapDispatchToProps)(StudiesContainer);
