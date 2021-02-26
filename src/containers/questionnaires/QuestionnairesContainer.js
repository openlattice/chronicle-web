// @flow

import React, { useEffect, useState } from 'react';

import { faPlus } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { Constants } from 'lattice';
import {
  // $FlowFixMe
  Box,
  Button,
  Card,
  CardSegment,
  // $FlowFixMe
  Grid,
  Select,
  Spinner,
} from 'lattice-ui-kit';
import { ReduxConstants } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import CreateQuestionnaireForm from './components/CreateQuestionnaireForm';
import QuestionnairesList from './QuestionnairesList';
import { STATUS_SELECT_OPTIONS } from './constants/constants';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { QUESTIONNAIRE_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';
import { GET_STUDY_QUESTIONNAIRES, getStudyQuestionnaires } from '../questionnaire/QuestionnaireActions';

const { OPENLATTICE_ID_FQN } = Constants;
const { REQUEST_STATE } = ReduxConstants;
const { STUDY_QUESTIONNAIRES } = QUESTIONNAIRE_REDUX_CONSTANTS;
const { ACTIVE_FQN } = PROPERTY_TYPE_FQNS;

const [ACTIVE, NOT_ACTIVE] = STATUS_SELECT_OPTIONS.map((status) => status.value);

const getActiveStatus = (entity :Map) => {
  const active = entity.getIn([ACTIVE_FQN, 0], false);
  return active ? ACTIVE : NOT_ACTIVE;
};

type Props = {
  study :Map;
};

const QuestionnairesContainer = ({ study } :Props) => {

  const dispatch = useDispatch();
  // state
  const [selectedStatus, setSelectedStatus] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [filteredListData, setFilteredListData] = useState(Map());

  const studyEKID = study.getIn([OPENLATTICE_ID_FQN, 0]);

  // selectors
  const studyQuestionnaires = useSelector(
    (state) => state.getIn(['questionnaire', STUDY_QUESTIONNAIRES, studyEKID], Map())
  );

  const getStudyQuestionnairesRS :RequestState = useSelector(
    (state) => state.getIn(['questionnaire', GET_STUDY_QUESTIONNAIRES, REQUEST_STATE])
  );

  // initially display all questionnaires
  useEffect(() => {
    setSelectedStatus(STATUS_SELECT_OPTIONS);
  }, []);

  useEffect(() => {
    if (studyQuestionnaires.isEmpty()) {
      dispatch((getStudyQuestionnaires(studyEKID)));
    }
  }, [studyQuestionnaires, studyEKID, dispatch]);

  useEffect(() => {
    setFilteredListData(studyQuestionnaires);
  }, [studyQuestionnaires]);

  useEffect(() => {
    let filtered = studyQuestionnaires;

    if (selectedStatus) {
      const filters = selectedStatus.map((selected) => selected.value);
      if (filters.length !== 0) {
        filtered = studyQuestionnaires.filter((entity) => filters.includes(getActiveStatus(entity)));
      }
    }

    setFilteredListData(filtered);
  }, [selectedStatus, studyQuestionnaires]);

  const onSelectStatus = (selectedOptions :Object[]) => {
    setSelectedStatus(selectedOptions);
  };

  if (getStudyQuestionnairesRS === RequestStates.PENDING) {
    return <Spinner size="2x" />;
  }

  return (
    <>
      <Card>
        {
          isEditing ? (
            <CreateQuestionnaireForm
                onClose={() => setIsEditing(false)}
                studyEKID={study.getIn([OPENLATTICE_ID_FQN, 0])} />
          ) : (
            <>
              <CardSegment>
                <Grid container spacing={2}>
                  <Grid item sm={9} xs={12}>
                    <Select
                        isDisabled={isEditing}
                        isMulti
                        onChange={onSelectStatus}
                        options={STATUS_SELECT_OPTIONS}
                        placeholder="Filter by status"
                        value={selectedStatus} />
                  </Grid>
                  <Grid item sm={3} xs={12}>
                    <Button
                        disabled={isEditing}
                        color="primary"
                        fullWidth
                        startIcon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() => setIsEditing(true)}>
                      New Questionnaire
                    </Button>
                  </Grid>
                </Grid>
                {
                  filteredListData.isEmpty() ? (
                    <Box textAlign="center" mt="20px">
                      No questionnaires found.
                    </Box>
                  ) : (
                    <QuestionnairesList
                        questionnaires={filteredListData}
                        studyEKID={study.getIn([OPENLATTICE_ID_FQN, 0])} />
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
