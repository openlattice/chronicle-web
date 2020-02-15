// @flow

import React, { useEffect } from 'react';

import qs from 'qs';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Colors,
  Sizes,
  Spinner,
  StyleUtils
} from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { RequestStates } from 'redux-reqseq';

import { getFullDateFromIsoDate } from '../../utils/DateUtils';
import SubmissionSuccessful from './components/SubmissionSuccessful';
import SurveyTable from './SurveyTable';
import { GET_CHRONICLE_APPS_DATA, SUBMIT_SURVEY, getChronicleAppsData } from './SurveyActions';

import OpenLatticeIcon from '../../assets/images/ol_icon.png';

const { NEUTRALS, WHITE } = Colors;
const { APP_CONTENT_WIDTH } = Sizes;
const { media } = StyleUtils;

const SurveyContainerWrapper = styled.div`
  flex-direction: column;
`;

const SurveyContentOuterWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
  position: relative;
`;

const SurveyContentInnerWrapper = styled.div`
  flex: 1 0 auto;
  max-width: ${APP_CONTENT_WIDTH}px;
  min-width: 0;
  width: 100%;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  ${media.phone`
    padding: 30px 10px 30px 10px;
  `}
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0 12px 30px;
  background-color: ${WHITE};

  > img {
    margin-right: 10px;
    height: 26px;
  }

  > h6 {
    font-size: 14px;
    color: ${NEUTRALS[0]};
    font-weight: 600;
    padding: 0;
    margin: 0;
  }
`;

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

const SurveyContainer = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const queryParams = qs.parse(history.location.search, { ignoreQueryPrefix: true });

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

  const getCurrentDate = () => getFullDateFromIsoDate(new Date().toISOString());

  if (requestStates[GET_CHRONICLE_APPS_DATA] === RequestStates.PENDING) {
    return (
      <SpinnerWrapper>
        <Spinner size="2x" />
      </SpinnerWrapper>
    );
  }

  const ErrorMessage = () => (
    <ErrorWrapper>
        Sorry, something went wrong. Please try refreshing the page, or contact support.
    </ErrorWrapper>
  );

  return (
    <SurveyContainerWrapper>
      <Header>
        <img src={OpenLatticeIcon} alt="OpenLattice Application Icon" />
        <h6> Chronicle </h6>
      </Header>
      {
        requestStates[GET_CHRONICLE_APPS_DATA] === RequestStates.FAILURE && <ErrorMessage />
      }

      {
        requestStates[GET_CHRONICLE_APPS_DATA] === RequestStates.SUCCESS
          && (
            <SurveyContentOuterWrapper>
              <SurveyContentInnerWrapper>
                {
                  requestStates[SUBMIT_SURVEY] === RequestStates.SUCCESS
                    ? <SubmissionSuccessful />
                    : (
                      <>
                        <SurveyTitle>
                          Apps Usage Survey
                        </SurveyTitle>
                        <CurrentDate>
                          {getCurrentDate()}
                        </CurrentDate>
                        <SurveyTable
                            submitRequestState={requestStates[SUBMIT_SURVEY]}
                            data={appsData}
                            participantId={participantId}
                            studyId={studyId} />
                      </>
                    )
                }
              </SurveyContentInnerWrapper>
            </SurveyContentOuterWrapper>
          )
      }
    </SurveyContainerWrapper>
  );
};

export default SurveyContainer;
