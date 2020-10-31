// @flow

import React from 'react';

import { Typography, Button } from 'lattice-ui-kit';
import styled from 'styled-components';
import { List } from 'immutable';

const Wrapper = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  grid-column-gap: 30px;
  margin-bottom: 20px;

  :last-of-type {
    margin-bottom: 0;
  }
`;

type Props = {
  date :string;
  entities :List;
  onDownloadData :(entity :List, date :string) => void;
}

const SummaryListComponent = ({ date, entities, onDownloadData } :Props) => (
  <Wrapper>
    <Typography variant="body1" gutterBottom>
      { date }
    </Typography>

    <Typography variant="body2" gutterBottom>
      { entities.size }
    </Typography>
    <div />
    <Button color="secondary" onClick={() => onDownloadData(entities, date)}> Preprocessed </Button>
  </Wrapper>
);

export default SummaryListComponent;
