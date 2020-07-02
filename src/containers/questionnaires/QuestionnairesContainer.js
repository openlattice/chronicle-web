// @flow

import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Constants } from 'lattice';
import {
  Card,
  CardSegment,
  PlusButton,
  Select,
  Spinner,
  StyleUtils,
  Table
} from 'lattice-ui-kit';
import { ReduxConstants } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import CreateQuestionnaireForm from './components/CreateQuestionnaireForm';
import TableHeaderRow from './table/TableHeaderRow';
import TableRow from './table/TableRow';
import { STATUS_SELECT_OPTIONS } from './constants/constants';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { QUESTIONNAIRE_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';
import { GET_STUDY_QUESTIONNAIRES, getStudyQuestionnaires } from '../questionnaire/QuestionnaireActions';

const { OPENLATTICE_ID_FQN } = Constants;
const { REQUEST_STATE } = ReduxConstants;
const { getStyleVariation } = StyleUtils;

const { STUDY_QUESTIONNAIRES } = QUESTIONNAIRE_REDUX_CONSTANTS;

const { ACTIVE_FQN } = PROPERTY_TYPE_FQNS;

const tableHeaders = ['title', 'status', 'actions'].map((header) => ({
  key: header,
  label: '',
  sortable: false
}));

const [ACTIVE, NOT_ACTIVE] = STATUS_SELECT_OPTIONS.map((status) => status.value);

const getActiveStatus = (entity :Map) => {
  const active = entity.getIn([ACTIVE_FQN, 0], false);
  return active ? ACTIVE : NOT_ACTIVE;
};

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const SelectWrapper = styled.div`
  min-width: 200px;
`;

const getWidthVariation = getStyleVariation('width', {
  default: 'auto',
  title: 'auto',
  status: '100px',
  actions: '110px'
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
};

const QuestionnairesContainer = ({ study } :Props) => {

  const dispatch = useDispatch();
  // state
  const [selectedStatus, setSelectedStatus] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [tableData, setTableData] = useState([]);

  const studyEKID = study.getIn([OPENLATTICE_ID_FQN, 0]);

  // selectors
  const studyQuestionnaires = useSelector(
    (state) => state.getIn(['questionnaire', STUDY_QUESTIONNAIRES, studyEKID], Map())
  );

  const getStudyQuestionnairesRS :RequestState = useSelector(
    (state) => state.getIn(['questionnaire', GET_STUDY_QUESTIONNAIRES, REQUEST_STATE])
  );

  useEffect(() => {
    if (studyQuestionnaires.isEmpty()) {
      dispatch((getStudyQuestionnaires(studyEKID)));
    }
  }, [studyQuestionnaires, studyEKID, dispatch]);

  useEffect(() => {
    setTableData((studyQuestionnaires.valueSeq().toJS()));
  }, [studyQuestionnaires]);

  useEffect(() => {
    let filtered = studyQuestionnaires;

    if (selectedStatus) {
      const filters = selectedStatus.map((selected) => selected.value);
      if (filters.length !== 0) {
        filtered = studyQuestionnaires.filter((entity) => filters.includes(getActiveStatus(entity)));
      }
    }

    setTableData((filtered.valueSeq().toJS()));
  }, [selectedStatus, studyQuestionnaires]);

  const onSelectStatus = (selectedOptions :Object[]) => {
    setSelectedStatus(selectedOptions);
  };

  // const RowComponent = ({ data: RowData } :any) => (
  //   <TableRow data={RowData} studyEKID={study.getIn([OPENLATTICE_ID_FQN, 0])} />
  // );

  const RowComponent = useMemo(() => ({ data: RowData }) => (
    <TableRow data={RowData} studyEKID={study.getIn([OPENLATTICE_ID_FQN, 0])} />
  ), [study]);

  if (getStudyQuestionnairesRS === RequestStates.PENDING) {
    return <Spinner size="1x" />;
  }

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
              <CardSegment padding="0px">
                {
                  tableData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px' }}>
                      No questionnaires found.
                    </div>
                  ) : (
                    <Table
                        components={{ HeadCell, Header: TableHeaderRow, Row: RowComponent }}
                        data={tableData}
                        headers={tableHeaders} />
                  )
                }
              </CardSegment>
            </>
          )
        }
      </Card>
    </>
  );
};

export default QuestionnairesContainer;
