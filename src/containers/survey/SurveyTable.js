// @flow
import React from 'react';

import {
  Table,
  Card,
  CardSegment,
  Button
} from 'lattice-ui-kit';
import styled from 'styled-components';

import {
  AppRow,
  TABLE_DATA,
  TABLE_HEADERS
} from './components';

const SubmitButtonWrapper = styled.div`
  margin-top: 20px;
  text-align: end
`;

const SurveyTable = () => {
  const handleOnSubmit = () => {
    // to do
  };

  const components = {
    Row: ({ data: rowData } :any) => (
      <AppRow data={rowData} />
    )
  };

  return (
    <Card>
      <CardSegment vertical>
        <Table
            data={TABLE_DATA}
            components={components}
            headers={TABLE_HEADERS} />

        <SubmitButtonWrapper>
          <Button
              mode="primary"
              onClick={handleOnSubmit}>
              Submit Survey
          </Button>
        </SubmitButtonWrapper>
      </CardSegment>
    </Card>
  );
};

export default SurveyTable;
