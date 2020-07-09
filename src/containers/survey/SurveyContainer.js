// @flow

import React, { useEffect } from 'react';

import qs from 'qs';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  Spinner,
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import SubmissionSuccessful from './components/SubmissionSuccessful';
import SurveyTable from './SurveyTable';
import { GET_CHRONICLE_APPS_DATA, SUBMIT_SURVEY, getChronicleAppsData } from './SurveyActions';

import BasicErrorComponent from '../shared/BasicErrorComponent';
import OpenLatticeIcon from '../../assets/images/ol_icon.png';

const SpinnerWrapper = styled.div`
  margin-top: 60px;
  text-align: center;
`;

const SurveyTitle = styled.h4`
  font-size: 20px;
  font-weight: 400;
  margin: 0;
  padding: 0;
`;

const SurveyDate = styled.h5`
  font-size: 16px;
  font-weight: 400;
  margin: 5px 0 20px 0;
`;

const SurveyContainer = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const queryParams = qs.parse(location.search, { ignoreQueryPrefix: true });

  // $FlowFixMe
  const { date, participantId, studyId } :{ date :string, participantId :string, studyId :UUID } = queryParams;

  // selectors
  const userApps = useSelector((state) => state.getIn(['appsData', 'appsData'], Map()));
  const getUserAppsRS :?RequestState = useRequestState(['appsData', GET_CHRONICLE_APPS_DATA]);
  const submitSurveyRS :?RequestState = useRequestState(['appsData', SUBMIT_SURVEY]);

  useEffect(() => {
    dispatch(getChronicleAppsData({
      date: date || DateTime.local().toISODate(),
      participantId,
      studyId,
    }));
  }, [dispatch, participantId, studyId, date]);

  const surveyDate = date ? DateTime.fromISO(date) : DateTime.local();

  if (getUserAppsRS === RequestStates.PENDING) {
    return (
      <SpinnerWrapper>
        <Spinner size="2x" />
      </SpinnerWrapper>
    );
  }

  return (
    <AppContainerWrapper>
      <AppHeaderWrapper appIcon={OpenLatticeIcon} appTitle="Chronicle" />
      <AppContentWrapper>
        {
          getUserAppsRS === RequestStates.FAILURE && <BasicErrorComponent />
        }
        {
          getUserAppsRS === RequestStates.SUCCESS && (
            <>
              {
                submitSurveyRS === RequestStates.SUCCESS
                  ? <SubmissionSuccessful />
                  : (
                    <>
                      <SurveyTitle>
                        Apps Usage Survey
                      </SurveyTitle>
                      <SurveyDate>
                        { surveyDate.toLocaleString(DateTime.DATE_FULL) }
                      </SurveyDate>
                      <SurveyTable
                          submitRequestState={submitSurveyRS}
                          data={userApps}
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
