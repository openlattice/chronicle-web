// @flow

import React, { useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Constants } from 'lattice';
import {
  Card,
  CardSegment,
  Colors,
  PlusButton,
  Select,
  StyleUtils,
  Table
} from 'lattice-ui-kit';

import CreateQuestionnaireForm from './components/CreateQuestionnaireForm';
import TableHeaderRow from './table/TableHeaderRow';
import TableRow from './table/TableRow';
import { STATUS_SELECT_OPTIONS } from './constants/constants';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';

const { ACTIVE_FQN, DESCRIPTION_FQN, NAME_FQN } = PROPERTY_TYPE_FQNS;
const { OPENLATTICE_ID_FQN } = Constants;

const { NEUTRALS } = Colors;
const { getStyleVariation } = StyleUtils;

const tableHeaders = ['title', 'status', 'actions'].map((header) => ({
  key: header,
  label: '',
  sortable: false
}));

const data = [
  {
    [NAME_FQN.toString()]: ['Ecological Momentary Assessment: Mood Rating'],
    [DESCRIPTION_FQN.toString()]: ['Questionnaire to assess mood adapted from https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5155083/'],
    [ACTIVE_FQN.toString()]: [true],
    id: 12
  },
  {
    [NAME_FQN.toString()]: ['Questionnaire 1'],
    [DESCRIPTION_FQN.toString()]:
      ['Questionnaire to end all questionnaires. Lord of the rings. On my way to Mordor. Once I get to Mordor, I will meet up with the greatest man that ever lived'],
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

type Props = {
  study :Map;
}

const QuestionnairesContainer = ({ study } :Props) => {

  const [selectedStatus, setSelectedStatus] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const onSearchInputChange = (event :SytheticEvent<HTMLInputElement>) => {

  };

  const onSelectStatus = (selectedOptions :Object[]) => {
    setSelectedStatus(selectedOptions);
  };

  return (
    <>
      <HeaderRow>
        <SelectWrapper>
          <Select
              isDisabled={isEditing}
              isMulti
              onChange={onSelectStatus}
              options={STATUS_SELECT_OPTIONS}
              placeholder="Filter by status"
              value={selectedStatus} />
        </SelectWrapper>
        <PlusButton
            disabled={isEditing}
            mode="primary"
            onClick={() => setIsEditing(true)}>
          New Questionnaire
        </PlusButton>
      </HeaderRow>
      <Card>
        {
          isEditing ? (
            <CreateQuestionnaireForm
                onExitEditMode={() => setIsEditing(false)}
                studyEKID={study.getIn([OPENLATTICE_ID_FQN, 0])} />
          ) : (
            <>
              <CardSegment padding="0">
                <Table
                    components={{ HeadCell, Header: TableHeaderRow, Row: TableRow }}
                    data={data}
                    headers={tableHeaders} />
              </CardSegment>
            </>
          )
        }

      </Card>
    </>
  );
};

export default QuestionnairesContainer;
