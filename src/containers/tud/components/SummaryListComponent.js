// @flow

import React from 'react';

import styled from 'styled-components';
import { ReduxUtils } from 'lattice-utils';
import { faCloudDownload } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List } from 'immutable';
import { IconButton, Typography } from 'lattice-ui-kit';
import type { RequestState } from 'redux-reqseq';

const { isPending } = ReduxUtils;

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
  downloadRS :RequestState;
  date :string;
  entities :List;
  onDownloadData :(entity :List, date :string) => void;
}

const SummaryListComponent = (
  {
    date,
    entities,
    onDownloadData,
    downloadRS
  } :Props
) => (
  <Wrapper>
    <Typography variant="body1" gutterBottom>
      { date }
    </Typography>

    <Typography variant="body2" gutterBottom>
      { entities.size }
    </Typography>
    <div />
    <IconButton color="primary" onClick={() => onDownloadData(entities, date)} isLoading={isPending(downloadRS)}>
      <FontAwesomeIcon icon={faCloudDownload} />
    </IconButton>
  </Wrapper>
);

export default SummaryListComponent;
