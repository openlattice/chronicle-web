// @flow

import React from 'react';

import styled from 'styled-components';
import { faCloudDownload } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List } from 'immutable';
// $FlowFixMe
import { Button, Grid, Typography } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import type { RequestState } from 'redux-reqseq';

import DataTypes from '../constants/DataTypes';
import type { DataType } from '../constants/DataTypes';

const { isPending } = ReduxUtils;

const Wrapper = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: auto auto 1fr 400px;
  grid-column-gap: 20px;
  margin-bottom: 20px;

  :last-of-type {
    margin-bottom: 0;
  }
`;

const ButtonWrapper = styled(Button)`
  padding-left: 8px;
  padding-right: 8px;
`;

type Props = {
  downloadRS :Map<DataType, RequestState>;
  date :string;
  entities :List;
  onDownloadData :(entity :List, date :string, dataType :DataType) => void;
}

const SummaryListComponent = (
  {
    date,
    downloadRS,
    entities,
    onDownloadData,
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

    <Grid container spacing={2}>
      <Grid item xs={4}>
        <ButtonWrapper
            fullWidth
            isLoading={isPending(downloadRS.get(DataTypes.SUMMARIZED))}
            onClick={() => onDownloadData(entities, date, DataTypes.SUMMARIZED)}
            size="small"
            startIcon={<FontAwesomeIcon icon={faCloudDownload} />}
            variant="outlined">
          Summarized
        </ButtonWrapper>
      </Grid>
      <Grid item xs={4}>
        <ButtonWrapper
            fullWidth
            isLoading={isPending(downloadRS.get(DataTypes.DAYTIME))}
            onClick={() => onDownloadData(entities, date, DataTypes.DAYTIME)}
            size="small"
            startIcon={<FontAwesomeIcon icon={faCloudDownload} />}
            variant="outlined">
          Daytime
        </ButtonWrapper>
      </Grid>
      <Grid item xs={4}>
        <ButtonWrapper
            fullWidth
            isLoading={isPending(downloadRS.get(DataTypes.NIGHTTIME))}
            onClick={() => onDownloadData(entities, date, DataTypes.NIGHTTIME)}
            size="small"
            startIcon={<FontAwesomeIcon icon={faCloudDownload} />}
            variant="outlined">
          Nighttime
        </ButtonWrapper>
      </Grid>
    </Grid>
  </Wrapper>
);

export default SummaryListComponent;
