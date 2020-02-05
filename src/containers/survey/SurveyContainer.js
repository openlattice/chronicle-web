// @flow

import React, { useEffect } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Colors,
  Sizes,
  Spinner,
  StyleUtils
} from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';

import SurveyTable from './SurveyTable';
import { GET_CHRONICLE_USER_APPS, getChronicleUserApps } from './SurveyActions';

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
  margin-top: 20px;
  text-align: center;
`;

const SurveyTitle = styled.h4`
  color: NEUTRALS[0];
  font-size: 22px;
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

  // TODO: these values should be obtained from the url
  const studyId = 'e9174c42-2308-427c-b565-47b7fd54db3f';
  const participantId = 'alfonce';

  useEffect(() => {
    dispatch(getChronicleUserApps({
      studyId,
      participantId
    }));
  }, [dispatch]);

  const requestStates = {
    [GET_CHRONICLE_USER_APPS]: useSelector(
      (state) => state.getIn(['userApps', GET_CHRONICLE_USER_APPS, 'requestState'], RequestStates.PENDING)
    )
  };

  const userApps = useSelector((state) => state.getIn(['userApps', 'userApps'], Map()));

  const getCurrentDate = () => new Date().toDateString();

  if (requestStates[GET_CHRONICLE_USER_APPS] === RequestStates.PENDING) {
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
        requestStates[GET_CHRONICLE_USER_APPS] === RequestStates.FAILURE
          ? <ErrorMessage />
          : (
            <SurveyContentOuterWrapper>
              <SurveyContentInnerWrapper>
                <SurveyTitle>
                      Apps Usage Survey
                </SurveyTitle>
                <CurrentDate>
                  {getCurrentDate()}
                </CurrentDate>
                <SurveyTable data={userApps} />
              </SurveyContentInnerWrapper>
            </SurveyContentOuterWrapper>
          )
      }
    </SurveyContainerWrapper>
  );
};

export default SurveyContainer;
