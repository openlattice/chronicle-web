// @flow

import React, {
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react';

import styled from 'styled-components';
import { Map, Set } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  StyleUtils,
  Table,
} from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import SubmissionFailureModal from './components/SubmissionFailureModal';
import TABLE_HEADERS from './utils/TableHeaders';
import TableDataDispatch from './utils/TableDataDispatch';
import TableRow from './components/TableRow';
import { SUBMIT_SURVEY, UPDATE_APP_USER_TYPE, submitSurvey } from './SurveyActions';

import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { resetRequestState } from '../../core/redux/ReduxActions';

const { USER_FQN } = PROPERTY_TYPE_FQNS;
const { media } = StyleUtils;

const SubmitButtonWrapper = styled.div`
  margin-top: 20px;
  text-align: end;
`;

const StyledCard = styled(Card)`
  ${media.phone`
    padding: 10px;
  `}
`;

const StyledCardSegment = styled(CardSegment)`
  ${media.phone`
    margin: 0 10px 0 10px;
  `}
`;

const NoAppsFound = styled.h4`
  font-weight: 400;
  font-size: 15px;
  text-align: center;
`;

function appsDataReducer(state, action :Object) {
  const { userType, entityId } = action;

  switch (action.type) {
    case UPDATE_APP_USER_TYPE: {
      const updatedData = state.updateIn(
        [entityId, 'associationDetails', USER_FQN.toString()],
        Set(),
        (users) => {
          const set = new Set(users);
          if (set.has(userType)) {
            return set.delete(userType);
          }
          return set.add(userType);
        }
      );
      return updatedData;
    }
    default:
      return state;
  }
}

type Props = {
  data :Map;
  participantId :string;
  studyId :UUID;
  submitRequestState :RequestState;
};

const SurveyTable = ({
  data,
  participantId,
  studyId,
  submitRequestState
} :Props) => {

  const rootDispatch = useDispatch();

  const [appsData, dispatch] = useReducer(appsDataReducer, data);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  useEffect(() => {
    setErrorModalVisible(submitRequestState === RequestStates.FAILURE);
  }, [errorModalVisible, setErrorModalVisible, submitRequestState]);

  const handleOnSubmit = () => {
    rootDispatch(submitSurvey({
      participantId,
      studyId,
      appsData
    }));
  };

  const hideErrorModal = () => {
    setErrorModalVisible(false);
    rootDispatch(resetRequestState(SUBMIT_SURVEY));
  };

  const components = useMemo(() => ({
    Row: ({ data: rowData } :any) => (
      <TableDataDispatch.Provider value={dispatch}>
        <TableRow data={rowData} />
      </TableDataDispatch.Provider>
    )
  }), []);

  return (
    <StyledCard>
      <StyledCardSegment vertical noBleed>
        {
          appsData.isEmpty()
            ? (
              <NoAppsFound>
                No apps found. Please try refreshing the page.
              </NoAppsFound>
            )
            : (
              <>
                <Table
                    data={appsData.valueSeq().toJS()}
                    components={components}
                    headers={TABLE_HEADERS} />

                <SubmitButtonWrapper>
                  <Button
                      isLoading={submitRequestState === RequestStates.PENDING}
                      mode="primary"
                      onClick={handleOnSubmit}>
                      Submit Survey
                  </Button>
                </SubmitButtonWrapper>
                <SubmissionFailureModal
                    handleOnClose={hideErrorModal}
                    isVisible={errorModalVisible} />
              </>
            )
        }

      </StyledCardSegment>
    </StyledCard>
  );
};

export default SurveyTable;
