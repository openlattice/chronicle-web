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
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { DateTime } from 'luxon';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import SubmissionSuccessful from './components/SubmissionSuccessful';
import SurveyForm from './components/SurveyForm';
import { GET_CHRONICLE_APPS_DATA, SUBMIT_SURVEY, getChronicleAppsData } from './SurveyActions';

import AppUsageFreqTypes from '../../utils/constants/AppUsageFreqTypes';
import BasicErrorComponent from '../shared/BasicErrorComponent';
import OpenLatticeIcon from '../../assets/images/ol_icon.png';
import Settings from '../../utils/constants/AppSettings';
import * as AppModules from '../../utils/constants/AppModules';
import { APP_REDUX_CONSTANTS, REDUCERS } from '../../utils/constants/ReduxConstants';
import { GET_APP_SETTINGS, getAppSettings } from '../app/AppActions';

const { SETTINGS } = APP_REDUX_CONSTANTS;

const { isPending } = ReduxUtils;

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

  const {
    date,
    organizationId,
    participantId,
    studyId
    // $FlowFixMe
  } :{ date :string, organizationId :UUID, participantId :string, studyId :UUID } = queryParams;

  // selectors
  const userAppsData = useSelector((state) => state.getIn([REDUCERS.APPS_DATA, 'appsData'], Map()));
  const settings = useSelector((state) => state.getIn([REDUCERS.APP, SETTINGS], Map()));

  const getUserAppsRS :?RequestState = useRequestState([REDUCERS.APPS_DATA, GET_CHRONICLE_APPS_DATA]);
  const submitSurveyRS :?RequestState = useRequestState([REDUCERS.APPS_DATA, SUBMIT_SURVEY]);
  const getAppSettingsRS :?RequestState = useRequestState([REDUCERS.APP, GET_APP_SETTINGS]);

  const appUsageFreqType = settings.getIn(
    [AppModules.DATA_COLLECTION, organizationId, Settings.APP_USAGE_FREQUENCY]
  ) || AppUsageFreqTypes.DAILY;

  useEffect(() => {
    dispatch(getChronicleAppsData({
      organizationId,
      date: date || DateTime.local().toISODate(),
      participantId,
      studyId,
    }));
  }, [dispatch, participantId, studyId, date, organizationId]);

  useEffect(() => {
    dispatch(getAppSettings({
      appName: AppModules.DATA_COLLECTION,
      organizationId
    }));
  }, [organizationId, dispatch]);

  const surveyDate = date ? DateTime.fromISO(date) : DateTime.local();

  if (isPending(getUserAppsRS) || isPending(getAppSettingsRS)) {
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
                      <SurveyForm
                          appUsageFreqType={appUsageFreqType}
                          organizationId={organizationId}
                          participantId={participantId}
                          studyId={studyId}
                          submitSurveyRS={submitSurveyRS}
                          userAppsData={userAppsData} />
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
