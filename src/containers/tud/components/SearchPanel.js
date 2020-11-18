// @flow

import React from 'react';
import { DateTime } from 'luxon';

import { ReduxUtils } from 'lattice-utils';

import type { RequestState } from 'redux-reqseq';

import {
  Typography,
  Button,
  Label,
  DatePicker
} from 'lattice-ui-kit';

import styled from 'styled-components';

const { isPending } = ReduxUtils;

const SearchGrid = styled.div`
  align-items: end;
  display: grid;
  grid-gap: 30px;
  grid-template-columns: auto auto 1fr 200px;
`;

type Props = {
  endDate :?DateTime;
  getSubmissionsRS :?RequestState;
  onGetSubmissions :() => void;
  onSetDate :(name :string, date :any) => void;
  startDate :?DateTime;
}
const SearchPanel = (props :Props) => {
  const {
    endDate,
    getSubmissionsRS,
    onGetSubmissions,
    onSetDate,
    startDate,
  } = props;

  return (
    <>
      <Typography variant="body2" gutterBottom>
        Search
      </Typography>
      <SearchGrid>
        <div>
          <Label subtle> Start Date </Label>
          <DatePicker
              value={startDate}
              onChange={(value) => onSetDate('startDate', value)} />
        </div>
        <div>
          <Label subtle> End Date </Label>
          <DatePicker
              value={endDate}
              onChange={(value) => onSetDate('endDate', value)} />
        </div>
        <div />
        <Button
            isLoading={isPending(getSubmissionsRS)}
            onClick={onGetSubmissions}>
          Search
        </Button>
      </SearchGrid>
    </>
  );
};

export default SearchPanel;
