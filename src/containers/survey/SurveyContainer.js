// @flow

import React, { useEffect } from 'react';

import qs from 'qs';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  Sizes,
  Spinner,
} from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { RequestStates } from 'redux-reqseq';

import SubmissionSuccessful from './components/SubmissionSuccessful';
import SurveyTable from './SurveyTable';
import { GET_CHRONICLE_APPS_DATA, SUBMIT_SURVEY, getChronicleAppsData } from './SurveyActions';

import OpenLatticeIcon from '../../assets/images/ol_icon.png';

const { APP_CONTENT_WIDTH } = Sizes;

const SpinnerWrapper = styled.div`
  margin-top: 60px;
  text-align: center;
`;

const ErrorWrapper = styled.div`
  margin-top: 50px;
  text-align: center;
`;

const SurveyTitle = styled.h4`
  color: NEUTRALS[0];
  font-size: 20px;
  font-weight: 400;
  margin: 0;
  padding: 0;
`;

const CurrentDate = styled.h5`
  font-size: 16px;
  font-weight: 400;
  margin: 5px 0 20px 0;
`;

const ErrorMessage = () => (
  <ErrorWrapper>
      Sorry, something went wrong. Please try refreshing the page, or contact support.
  </ErrorWrapper>
);

const SurveyContainer = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const queryParams = qs.parse(location.search, { ignoreQueryPrefix: true });

  // $FlowFixMe
  const { studyId, participantId } :{ participantId :string, studyId :UUID } = queryParams;

  useEffect(() => {
    dispatch(getChronicleAppsData({
      studyId,
      participantId
    }));
  }, [dispatch, participantId, studyId]);

  const { appsData, requestStates } = useSelector((state) => ({
    appsData: state.getIn(['appsData', 'appsData'], Map()),
    requestStates: {
      [GET_CHRONICLE_APPS_DATA]: state.getIn(['appsData', GET_CHRONICLE_APPS_DATA, 'requestState']),
      [SUBMIT_SURVEY]: state.getIn(['appsData', SUBMIT_SURVEY, 'requestState'])
    }
  }));

  if (requestStates[GET_CHRONICLE_APPS_DATA] === RequestStates.PENDING) {
    return (
      <SpinnerWrapper>
        <Spinner size="2x" />
      </SpinnerWrapper>
    );
  }

  return (
    <AppContainerWrapper>
      <AppHeaderWrapper appIcon={OpenLatticeIcon} appTitle="Chronicle" />
      <AppContentWrapper contentWidth={APP_CONTENT_WIDTH}>
        {
          requestStates[GET_CHRONICLE_APPS_DATA] === RequestStates.FAILURE && <ErrorMessage />
        }
        {
          requestStates[GET_CHRONICLE_APPS_DATA] === RequestStates.SUCCESS && (
            <>
              {
                requestStates[SUBMIT_SURVEY] === RequestStates.SUCCESS
                  ? <SubmissionSuccessful />
                  : (
                    <>
                      <SurveyTitle>
                        Apps Usage Survey
                      </SurveyTitle>
                      <CurrentDate>
                        { DateTime.local().toLocaleString(DateTime.DATE_FULL) }
                      </CurrentDate>
                      <SurveyTable
                          submitRequestState={requestStates[SUBMIT_SURVEY]}
                          data={appsData}
                          participantId={participantId}
                          studyId={studyId} />
                    </>
                  )
              }
            </>
          )
        }
      </AppContentWrapper>
    </AppContainerWrapper>
  );
};

export default SurveyContainer;
