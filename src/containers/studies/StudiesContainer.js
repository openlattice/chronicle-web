import React, { Component } from 'react';

import styled from 'styled-components';
import {
  Button,
  Card,
  CardHeader,
  CardSegment,
  Colors
} from 'lattice-ui-kit';

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

const studies = [
  {uuid: 1, name: 'Chrome ', version: '1.0', description: 'lajdfkldsjf;dsf dsfldskf ldsfkl jdsfkljdslk jlkdsjfkl ds, lajdfkldsjf;dsf dsfldskf ldsfkl jdsfkljdslk jlkdsjfkl ds'},
  {uuid: 2, name: 'Notebook', version: '1.0', description: 'lajdfkldsjf;dsf dsfldskf ldsfkl jdsfkljdslk jlkdsjfkl ds'},
  {uuid: 3, name: 'Password', version: '1.0', description: 'lajdfkldsjf;dsf dsfldskf ldsfkl jdsfkljdslk jlkdsjfkl ds'},
  {uuid: 4, name: 'Daingng ', version: '1.0', description: 'lajdfkldsjf;dsf dsfldskf ldsfkl jdsfkljdslk jlkdsjfkl ds'},
  {uuid: 5, name: 'Friday Study', version: '1.0', description: 'lajdfkldsjf;dsf dsfldskf ldsfkl jdsfkljdslk jlkdsjfkl ds'}
]

const StudyDescription = styled.p`
  font-size: 14px;
  color: ${NEUTRALS[1]};
`
class StudiesContainer extends Component {
  openCreateStudyModal = () => {
    console.log("button clicked")
  }

  renderStudyItem = (item) => {
    return (
      <Card key={item.uuid}>
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
    return (
      <>
        <ContainerHeader>
          <h1> Studies </h1>
          <Button mode="primary" onClick = {this.openCreateStudyModal}> Create Study </Button>
        </ContainerHeader>
        <CardGrid>
          {studies.map((item) => this.renderStudyItem(item))}
        </CardGrid>
      </>
    )
  }
}
export default StudiesContainer;
