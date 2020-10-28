// @flow

import React from 'react';
import { DateTime } from 'luxon';

import {
  Typography,
  Button,
  Label,
  DatePicker
} from 'lattice-ui-kit';

import styled from 'styled-components';

const SearchGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto 1fr 200px;
  grid-gap: 30px;
  align-items: end;
`;

type Props = {
  endDate :?DateTime;
  isLoading :boolean;
  onGetSubmissions :() => void;
  onSetDate :(name :string, date :any) => void;
  startDate :?DateTime;
}
const SearchPanel = (props :Props) => {
  const {
    endDate,
    isLoading,
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
            isLoading={isLoading}
            onClick={onGetSubmissions}>
          Search
        </Button>
      </SearchGrid>
    </>
  );
};

export default SearchPanel;
