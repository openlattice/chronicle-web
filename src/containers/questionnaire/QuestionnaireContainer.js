// @flow

import React, { useEffect } from 'react';

import qs from 'qs';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  Spinner,
} from 'lattice-ui-kit';
import { ReduxConstants } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { RequestStates } from 'redux-reqseq';

import QuestionnaireForm from './components/QuestionnaireForm';
import SubmissionStatus from './components/SubmissionStatus';
import {
  GET_QUESTIONNAIRE,
  SUBMIT_QUESTIONNAIRE,
  getQuestionnaire
} from './QuestionnaireActions';

import BasicErrorComponent from '../shared/BasicErrorComponent';
import OpenLatticeIcon from '../../assets/images/ol_icon.png';
import { PROPERTY_TYPE_FQNS } from '../../core/edm/constants/FullyQualifiedNames';
import { QUESTIONNAIRE_REDUX_CONSTANTS } from '../../utils/constants/ReduxConstants';

const { REQUEST_STATE } = ReduxConstants;
const { NAME_FQN, DESCRIPTION_FQN } = PROPERTY_TYPE_FQNS;
const { QUESTIONNAIRE_DATA } = QUESTIONNAIRE_REDUX_CONSTANTS;

const Title = styled.h4`
  font-size: 20px;
  font-weight: 400;
  margin: 0;
  padding: 0;
`;

const Description = styled.h6`
  font-size: 16px;
  font-weight: 400;
  padding: 0;
  margin: 5px 0 20px 0;
`;

const QuestionnaireContainer = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const questionnaire = useSelector((state) => state.getIn(['questionnaire', QUESTIONNAIRE_DATA], Map()));
  const requestStates = useSelector((state) => ({
    [GET_QUESTIONNAIRE]: state.getIn(['questionnaire', GET_QUESTIONNAIRE, REQUEST_STATE]),
    [SUBMIT_QUESTIONNAIRE]: state.getIn(['questionnaire', SUBMIT_QUESTIONNAIRE, REQUEST_STATE])
  }));

  const queryParams = qs.parse(location.search, { ignoreQueryPrefix: true });
  const {
    participantId,
    questionnaireId,
    studyId
  } :{
    participantId :UUID,
    questionnaireId :UUID,
    studyId :UUID
    // $FlowFixMe
  } = queryParams;

  useEffect(() => {
    dispatch(getQuestionnaire({ studyId, questionnaireId }));
  }, [dispatch, questionnaireId, studyId]);

  const questionnaireDetails = questionnaire.get('questionnaireDetails', Map());

  return (
    <AppContainerWrapper>
      <AppHeaderWrapper appIcon={OpenLatticeIcon} appTitle="Chronicle" />
      <AppContentWrapper>
        {
          requestStates[GET_QUESTIONNAIRE] === RequestStates.PENDING && (
            <div style={{ marginTop: '60px', textAlign: 'center' }}>
              <Spinner size="2x" />
            </div>
          )
        }
        {
          requestStates[GET_QUESTIONNAIRE] === RequestStates.FAILURE && <BasicErrorComponent />
        }
        {
          requestStates[SUBMIT_QUESTIONNAIRE] === RequestStates.FAILURE && (
            <SubmissionStatus />
          )
        }
        {
          requestStates[SUBMIT_QUESTIONNAIRE] === RequestStates.SUCCESS && (
            <SubmissionStatus success />
          )
        }
        {
          requestStates[GET_QUESTIONNAIRE] === RequestStates.SUCCESS
          && requestStates[SUBMIT_QUESTIONNAIRE] !== RequestStates.SUCCESS
          && (
            <>
              <Title>
                { questionnaireDetails.getIn([NAME_FQN, 0]) }
              </Title>
              <Description>
                { questionnaireDetails.getIn([DESCRIPTION_FQN, 0]) }
              </Description>
              <QuestionnaireForm
                  participantId={participantId}
                  questions={questionnaire.get('questions', List())}
                  studyId={studyId}
                  submitRequestState={requestStates[SUBMIT_QUESTIONNAIRE]} />
            </>
          )
        }
      </AppContentWrapper>
    </AppContainerWrapper>
  );
};

export default QuestionnaireContainer;
