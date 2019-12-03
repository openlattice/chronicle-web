import React, { Component } from 'react';

import styled from 'styled-components';
import {
  Button
} from 'lattice-ui-kit';

const ContainerHeader = styled.section`
  display: flex;
  margin: 20px 0 0 0;
  justify-content: space-between;
  >h1 {
    font-size: 28px;
    font-weight: normal;
    margin: 0;
    padding: 0;
  }
`;
class StudiesContainer extends Component {
  openCreateStudyModal = () => {
    alert("button was clicked but who cares")
  }
  render() {
    return (
      <>
        <ContainerHeader>
          <h1> Studies </h1>
          <Button mode="primary" onClick = {this.openCreateStudyModal}> Create Study </Button>
        </ContainerHeader>
      </>
    )
  }
}
export default StudiesContainer;
