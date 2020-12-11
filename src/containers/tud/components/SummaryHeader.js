// @flow

import React from 'react';

import styled from 'styled-components';
import { List } from 'immutable';
import { Typography } from 'lattice-ui-kit';
import type { RequestState } from 'redux-reqseq';

import DownloadAllButton from './DownloadAllButton';

import type { DataType } from '../constants/DataTypes';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  grid-gap: 30px;
  margin-bottom: 10px;
`;

// TODO: Add additional button to download summarized

type Props = {
  onDownloadData :(entity :?List, date :?string, dataType :DataType) => void;
  downloadAllDataRS :?RequestState;
}

const SummaryHeader = ({ onDownloadData, downloadAllDataRS } :Props) => (
  <Wrapper>
    <Typography variant="overline" display="block" gutterBottom>
      Date
    </Typography>

    <Typography variant="overline" display="block" gutterBottom>
      Number of Submissions
    </Typography>
    <div />
    <DownloadAllButton downloadAllDataRS={downloadAllDataRS} onDownloadData={onDownloadData} />
  </Wrapper>
);

export default SummaryHeader;
