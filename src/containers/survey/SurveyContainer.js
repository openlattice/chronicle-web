// @flow

import React, { useEffect } from 'react';

import { useDispatch } from 'react-redux';

import styled from 'styled-components';
import {
  AppContentWrapper,
  Colors,
  Sizes,
} from 'lattice-ui-kit';

import SurveyTable from './SurveyTable';
import { getChronicleUserApps } from './SurveyActions';

import OpenLatticeIcon from '../../assets/images/ol_icon.png';

const { NEUTRALS, WHITE } = Colors;
const { APP_CONTENT_WIDTH } = Sizes;

const SurveyContainerWrapper = styled.div`
  flex-direction: column;
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

  // temp
  const studyId = 'e9174c42-2308-427c-b565-47b7fd54db3f';
  const participantId = 'alfonce';

  useEffect(() => {
    dispatch(getChronicleUserApps({
      studyId,
      participantId
    }));
  }, [dispatch]);

  const getCurrentDate = () => new Date().toDateString();

  return (
    <SurveyContainerWrapper>
      <Header>
        <img src={OpenLatticeIcon} alt="OpenLattice Application Icon" />
        <h6> Chronicle </h6>
      </Header>
      <AppContentWrapper contentWidth={APP_CONTENT_WIDTH}>
        <SurveyTitle>
          Apps Usage Survey
        </SurveyTitle>
        <CurrentDate>
          {getCurrentDate()}
        </CurrentDate>
        <SurveyTable />
      </AppContentWrapper>
    </SurveyContainerWrapper>
  );
};

export default SurveyContainer;
