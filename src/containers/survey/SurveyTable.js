// @flow

import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  Table
} from 'lattice-ui-kit';

import { TABLE_HEADERS, TableRow } from './components';

const SubmitButtonWrapper = styled.div`
  margin-top: 20px;
  text-align: end
`;

type Props = {
  userApps :Map;
}

const SurveyTable = ({ userApps } :Props) => {
  const handleOnSubmit = () => {
    // to do
  };

  const components = {
    Row: ({ data: rowData } :any) => (
      <TableRow data={rowData} />
    )
  };

  return (
    <Card>
      <CardSegment vertical>
        <Table
            data={userApps.valueSeq().toJS()}
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
