// @flow

import React, { useState } from 'react';

import styled from 'styled-components';
import {
  Card,
  CardSegment,
  Colors,
  PlusButton,
  SearchInput,
  Select,
  StyleUtils,
  Table
} from 'lattice-ui-kit';

import TableRow from './table/TableRow';
import TableHeaderRow from './table/TableHeaderRow';
import { STATUS_SELECT_OPTIONS } from './constants/constants';

const { NEUTRALS } = Colors;
const { getStyleVariation } = StyleUtils;

const tableHeaders = ['title', 'status', 'actions'].map((header) => ({
  key: header,
  label: '',
  sortable: false
}));

const data = [
  {
    title: 'Ecological Momentary Assessment: Mood Rating',
    description: 'Questionnaire to assess mood adapted from https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5155083/',
    status: 'active',
    id: 12
  },
  {
    title: 'Questionnaire 1',
    description: 'Questionnaire to end all questionnaires. Lord of the rings.On my way to Mordor. Once I get to Mordor, I will meet up with the greatest man that ever lived',
    status: 'Inactive',
    id: 32
  }
];

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const CardHeader = styled.div`
  background-color: ${NEUTRALS[6]};
  padding: 20px 30px;
`;

const SearchWrapper = styled.div`
  width: 100%;
`;

const SelectWrapper = styled.div`
  min-width: 200px;
`;

const getWidthVariation = getStyleVariation('width', {
  default: 'auto',
  title: 'auto',
  status: '100px',
  actions: '100px'
});

const Cell = styled.td`
  width: ${getWidthVariation};
`;

type HeadCellProps = {
  width :string;
};

const HeadCell = ({ width } :HeadCellProps) => (
  <Cell width={width} />
);

const QuestionnairesContainer = () => {
  const [selectedStatus, setSelectedStatus] = useState([]);
  const onSearchInputChange = (event :SytheticEvent<HTMLInputElement>) => {

  };

  const onSelectStatus = (selectedOptions :Object[]) => {
    setSelectedStatus(selectedOptions);
  };

  console.log(selectedStatus);

  return (
    <>
      <HeaderRow>
        <SelectWrapper>
          <Select
              isMulti
              onChange={onSelectStatus}
              options={STATUS_SELECT_OPTIONS}
              placeholder="Filter by status"
              value={selectedStatus} />
        </SelectWrapper>
        <PlusButton mode="primary"> New Questionnaire </PlusButton>
      </HeaderRow>
      <Card>
        <CardHeader>
          <SearchWrapper>
            <SearchInput placeholder="Search" />
          </SearchWrapper>
        </CardHeader>
        <CardSegment padding="0">
          <Table
              components={{ HeadCell, Header: TableHeaderRow, Row: TableRow }}
              data={data}
              headers={tableHeaders} />
        </CardSegment>
      </Card>
    </>
  );
};

export default QuestionnairesContainer;
